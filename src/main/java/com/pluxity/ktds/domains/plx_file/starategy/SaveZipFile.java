package com.pluxity.ktds.domains.plx_file.starategy;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.FileUtil;
import com.pluxity.ktds.global.utils.ZipUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static com.pluxity.ktds.global.constant.ErrorCode.FAILED_DELETE_FILE;
import static com.pluxity.ktds.global.constant.ErrorCode.FAILED_SAVE_FILE;

@Component
@RequiredArgsConstructor
@Slf4j
public class SaveZipFile implements SaveStrategy {
    @Override
    public FileInfo fileSave(MultipartFile file, Path directoryPath) throws IOException {
        String zipUuid = UUID.randomUUID().toString();  // ZIP과 GLB가 공유할 UUID
        
        try {
            FileUtil.checkExtractable(file);
            Files.createDirectories(directoryPath);
            
            // ICON3D 타입인 경우 GLB 파일명을 ZIP과 같은 UUID로 변경
            String glbUuid = directoryPath.toString().contains("3D") ? zipUuid : null;
            ZipUtil.extractFiles(file.getInputStream(), directoryPath, glbUuid);
            
        } catch (IOException e) {
            rollback(directoryPath);
            log.error(FAILED_SAVE_FILE.getMessage());
            throw new CustomException(FAILED_SAVE_FILE);
        }
        
        return createFileInfo(file, directoryPath, zipUuid);
    }
    
    /**
     * ZIP과 GLB가 같은 UUID를 사용하도록 FileInfo 생성
     */
    private FileInfo createFileInfo(MultipartFile file, Path directoryPath, String zipUuid) throws IOException {
        String extension = FileUtil.getExtension(file.getOriginalFilename());
        String directoryName = directoryPath.getParent().relativize(directoryPath).toString();
        
        // ZIP 파일을 지정된 UUID로 저장
        Files.copy(file.getInputStream(), directoryPath.resolve(zipUuid + "." + extension));
        
        return FileInfo.builder()
                .originName(file.getOriginalFilename())
                .extension(extension)
                .storedName(zipUuid)  // ZIP과 GLB가 같은 UUID 사용
                .directoryName(directoryName)
                .build();
    }

    @Override
    public FileInfo fileSave(File file, Path directoryPath) throws IOException {
        return null;
    }


    private void rollback(Path tempDirectoryPath) {
        try {
            deleteDirectory(tempDirectoryPath);
        } catch (CustomException e) {
            log.error(e.getErrorCode().getMessage());
            throw new CustomException(FAILED_DELETE_FILE);
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new CustomException(FAILED_DELETE_FILE);
        }
    }

}