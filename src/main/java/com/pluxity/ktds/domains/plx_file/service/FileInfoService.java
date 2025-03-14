package com.pluxity.ktds.domains.plx_file.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.starategy.SaveStrategy;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.utils.ZipUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class FileInfoService {

    @Value("${root-path.upload}")
    private String uploadRootPath;

    private final FileInfoRepository fileInfoRepository;

    public FileInfo findById(Long id) {
        return fileInfoRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_FILE));
    }

    public FileInfoDTO saveFile(MultipartFile file, FileEntityType type, SaveStrategy saveStrategy) throws IOException {
        Objects.requireNonNull(saveStrategy, () -> {
            log.error(INVALID_FILE_IO_STRATEGY.getMessage());
            throw new CustomException(INVALID_FILE_IO_STRATEGY);
        });

        String uuid = UUID.randomUUID().toString();
        Path targetDirectoryPath = Path.of(uploadRootPath, type.getType(), uuid);

        FileInfo fileInfo = saveStrategy.fileSave(file, targetDirectoryPath);
        fileInfo.changeFileEntityType(type);
        fileInfoRepository.save(fileInfo);
        return fileInfo.toDto();
    }
    public FileInfoDTO saveFile(File file, FileEntityType type, SaveStrategy saveStrategy) throws IOException {
        Objects.requireNonNull(saveStrategy, () -> {
            log.error(INVALID_FILE_IO_STRATEGY.getMessage());
            throw new CustomException(INVALID_FILE_IO_STRATEGY);
        });

        String uuid = UUID.randomUUID().toString();
        Path targetDirectoryPath = Path.of(uploadRootPath, type.getType(), uuid);

        FileInfo fileInfo = saveStrategy.fileSave(file, targetDirectoryPath);
        fileInfo.changeFileEntityType(type);
        fileInfoRepository.save(fileInfo);
        return fileInfo.toDto();
    }

    public void deleteDirectoryByDirectory(Path path) {
        FileInfo fileInfo = fileInfoRepository.findByDirectoryName(path.toString())
                .orElseThrow(() -> new CustomException(NOT_FOUND_FILE_DIRECTORY));

        try {
            Path deleteDirectory = Path.of(fileInfo.getDirectoryName());
            if (Files.exists(deleteDirectory)) {
                try (Stream<Path> walk = Files.walk(deleteDirectory)) {
                    walk.sorted(Comparator.reverseOrder())
                            .forEach(p -> {
                                try {
                                    Files.delete(p);
                                } catch (IOException e) {
                                    log.error(FAILED_TO_DELETE_DIRECTORY.getMessage());
                                    throw new CustomException(FAILED_TO_DELETE_DIRECTORY);
                                }
                            });
                }
                fileInfoRepository.deleteById(fileInfo.getId());
            }
        } catch (IOException e) {
            log.error(FAILED_TO_DELETE_DIRECTORY.getMessage());
            throw new CustomException(FAILED_TO_DELETE_DIRECTORY);
        }
    }

    public Path createBackup(MultipartFile file, FileEntityType type) {
        String currentDate = new SimpleDateFormat("yyyyMMdd-HHmmss").format(new Date());
        Path backupName = Path.of("history", file.getOriginalFilename() + "_" + currentDate + ".zip");
        Path backupPath = Path.of(uploadRootPath, type.getType()).resolve(backupName);
        try {
            Files.createDirectories(backupPath.getParent());

            if (Objects.requireNonNull(file.getOriginalFilename()).endsWith("zip")) {
                Files.copy(file.getInputStream(), backupPath, StandardCopyOption.REPLACE_EXISTING);
            } else {
                ZipUtil.zip(file, backupPath);
            }
            return backupPath;
        } catch (IOException e) {
            log.error(FAILED_TO_CREATE_BACKUP.getMessage());
            throw new CustomException(FAILED_TO_CREATE_BACKUP);
        }

    }
}
