package com.pluxity.ktds.domains.plx_file.starategy;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static com.pluxity.ktds.global.constant.ErrorCode.FAILED_DELETE_FILE;
import static com.pluxity.ktds.global.constant.ErrorCode.FAILED_SAVE_FILE;

@Component
@RequiredArgsConstructor
@Slf4j
public class SaveImage implements SaveStrategy {
    @Override
    public FileInfo fileSave(MultipartFile file, Path directoryPath) throws IOException {

        FileUtil.checkImage(file.getInputStream());

        try {
            Files.createDirectories(directoryPath);
        } catch (IOException e) {
            rollback(directoryPath);
            log.error(FAILED_SAVE_FILE.getMessage());
        }

        return saveFileInfo(file, directoryPath);
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