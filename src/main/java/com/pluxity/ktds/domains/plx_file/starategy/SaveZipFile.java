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
        String glbUuid = directoryPath.toString().contains("3D") ? zipUuid : null;  // GLB 파일명을 변경할 UUID
        try {
            FileUtil.checkExtractable(file);
            Files.createDirectories(directoryPath);
            
            // ICON3D 타입인 경우 GLB 파일명을 ZIP과 같은 UUID로 변경
            ZipUtil.extractFiles(file.getInputStream(), directoryPath, glbUuid);
            
        } catch (IOException e) {
            rollback(directoryPath);
            log.error(FAILED_SAVE_FILE.getMessage());
            throw new CustomException(FAILED_SAVE_FILE);
        }
        return saveFileInfo(file, directoryPath, glbUuid);
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