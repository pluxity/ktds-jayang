package com.pluxity.ktds.domains.plx_file.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDto;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class Image2DFileStrategyTest {

    @Value("${root-path}")
    private String rootPath;
    @Autowired
    SaveImage saveImage;
    @Autowired
    FileInfoService fileInfoService;
    @Autowired
    FileInfoRepository fileInfoRepository;

    @Test
    void saveFile() throws IOException {
        Path pngFilePath = Paths.get("src", "test", "resources", "2dIcon.png");
        byte[] fileContent = Files.readAllBytes(pngFilePath);
        MultipartFile file = new MockMultipartFile(
                "file",
                pngFilePath.getFileName().toString(),
                "image/png",
                fileContent);
        Path entityFolder = Paths.get(rootPath, FileEntityType.ICON2D.getType());

        FileInfoDto fileInfoDto = fileInfoService.saveFile(file, FileEntityType.ICON2D, saveImage);

        assertThat(fileInfoDto.id()).isNotNull();
        assertThat(Files.exists(entityFolder)).isTrue();
        assertFolderContainsLatestFolder(entityFolder);
        assertFolderContainsFile(fileInfoDto.id(), entityFolder);
        assertFileInfo(fileInfoDto.id(), pngFilePath);
//        assertDeletion(entityFolder, fileInfoId);
    }

    private void assertFolderContainsLatestFolder(Path entityFolder) throws IOException {
        Optional<Path> latestFolder = Files.list(entityFolder)
                .filter(Files::isDirectory)
                .max(Comparator.comparingLong(path -> path.toFile().lastModified()));
        assertThat(latestFolder).isPresent();
    }

    private void assertFolderContainsFile(Long fileInfoId, Path entityFolder) throws IOException {
        UUID uuid = UUID.fromString(Files.list(entityFolder)
                .filter(Files::isDirectory)
                .max(Comparator.comparingLong(path -> path.toFile().lastModified()))
                .orElseThrow()
                .getFileName()
                .toString());
        Path uuidFolder = entityFolder.resolve(uuid.toString());
        assertThat(Files.exists(uuidFolder)).isTrue();

        FileInfo fileInfo = fileInfoRepository.findById(fileInfoId).orElseThrow();
        String storedFileName = fileInfo.getStoredName() + "." + fileInfo.getExtension();
        Path targetFilePath = uuidFolder.resolve(storedFileName);
        assertThat(Files.exists(targetFilePath)).isTrue();
    }

    private void assertFileInfo(Long fileInfoId, Path pngFilePath) {
        FileInfo fileInfo = fileInfoRepository.findById(fileInfoId).orElseThrow();
        assertThat(fileInfo.getOriginName()).isEqualTo(pngFilePath.getFileName().toString());
        assertThat(fileInfo.getExtension()).isEqualTo(pngFilePath.getFileName().toString().split("\\.")[1]);
        assertThat(fileInfo.getDirectoryName()).isNotNull();
    }

    private void assertDeletion(Path entityFolder, Long fileInfoId) {
        FileInfo fileInfo = fileInfoRepository.findById(fileInfoId).orElseThrow();
        Path uuidFolder = Paths.get(fileInfo.getDirectoryName());
        Path targetFilePath = uuidFolder.resolve(fileInfo.getStoredName() + "." + fileInfo.getExtension());
        Path directory = Path.of(rootPath, fileInfo.getFileEntityType(), fileInfo.getDirectoryName());
        fileInfoService.deleteDirectoryByDirectory(directory);
        assertThat(Files.exists(targetFilePath)).isFalse();
        assertThat(Files.exists(uuidFolder)).isFalse();
        assertThat(Files.exists(entityFolder)).isTrue();
    }


}