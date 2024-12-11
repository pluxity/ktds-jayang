package com.pluxity.ktds.domains.plx_file.starategy;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.FileUtil;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.UUID;
import java.util.stream.Stream;

import static com.pluxity.ktds.global.constant.ErrorCode.FAILED_TO_DELETE_DIRECTORY;


public interface SaveStrategy {


    FileInfo fileSave(MultipartFile file, Path directoryPath) throws IOException;

    default FileInfo saveFileInfo(MultipartFile file, Path directoryPath) throws IOException {
        String storedName = UUID.randomUUID().toString();
        String extension = FileUtil.getExtension(file.getOriginalFilename());
        Files.copy(file.getInputStream(), directoryPath.resolve(storedName + "." + extension));

        return FileInfo.builder()
                .originName(file.getOriginalFilename())
                .extension(extension)
                .storedName(storedName)
                .directoryName(directoryPath.getParent().relativize(directoryPath).toString())
                .build();
    }

    default void deleteDirectory(Path path) throws IOException, CustomException {
        if (Files.exists(path)) {
            try (Stream<Path> walk = Files.walk(path)) {
                walk.sorted(Comparator.reverseOrder())
                        .forEach(p -> {
                            try {
                                Files.delete(p);
                            } catch (IOException e) {
                                throw new CustomException(FAILED_TO_DELETE_DIRECTORY);
                            }
                        });
            }
        }
    }


}
