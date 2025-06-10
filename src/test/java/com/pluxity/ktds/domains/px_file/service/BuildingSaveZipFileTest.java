package com.pluxity.ktds.domains.plx_file.service;

import com.pluxity.ktds.domains.building.dto.FileInfoDto;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.domains.plx_file.service.FileInfoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class BuildingSaveZipFileTest {

    @Value("${root-path}")
    private String rootPath;
    @Autowired
    SaveZipFile saveZipFile;
    @Autowired
    FileInfoService fileInfoService;
    @Autowired
    FileInfoRepository fileInfoRepository;

    @Test
    void saveFile() throws IOException {
        Path zipFilePath = Paths.get("src", "test", "resources", "building.zip");
        byte[] fileContent = Files.readAllBytes(zipFilePath);
        MultipartFile file = new MockMultipartFile(
                "file",
                zipFilePath.getFileName().toString(),
                "application/zip",
                fileContent);
        Path entityFolder = Paths.get(rootPath, FileEntityType.BUILDING.getType());

        FileInfoDto fileInfoDto = fileInfoService.saveFile(file, FileEntityType.BUILDING, saveZipFile);

        assertThat(fileInfoDto.id()).isNotNull();
        assertThat(Files.exists(entityFolder)).isTrue();
        assertFolderContainsLatestFolder(entityFolder);
        assertFolderContainsZipEntries(fileInfoDto.id(), entityFolder, file);
        assertFileInfo(fileInfoDto.id(), file);
//        assertDeletion(entityFolder, fileInfoId);
    }

    private void assertFolderContainsLatestFolder(Path entityFolder) throws IOException {
        Optional<Path> latestFolder = Files.list(entityFolder)
                .filter(Files::isDirectory)
                .max(Comparator.comparingLong(path -> path.toFile().lastModified()));
        assertThat(latestFolder).isPresent();
    }

    private void assertFolderContainsZipEntries(Long fileInfoId, Path entityFolder, MultipartFile file) throws IOException {
        UUID uuid = UUID.fromString(Files.list(entityFolder)
                .filter(Files::isDirectory)
                .max(Comparator.comparingLong(path -> path.toFile().lastModified()))
                .orElseThrow()
                .getFileName()
                .toString());
        Path uuidFolder = entityFolder.resolve(uuid.toString());
        assertThat(Files.exists(uuidFolder)).isTrue();

        try (ZipInputStream zis = new ZipInputStream(file.getInputStream(), Charset.forName("euc-kr"))) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                Path compressedFile = uuidFolder.resolve(zipEntry.getName());
                assertThat(Files.exists(compressedFile)).isTrue();
                zipEntry = zis.getNextEntry();
            }
        }

        FileInfo fileInfo = fileInfoRepository.findById(fileInfoId).orElseThrow();
        String storedFileName = fileInfo.getStoredName() + "." + fileInfo.getExtension();
        Path targetFilePath = uuidFolder.resolve(storedFileName);
        assertThat(Files.exists(targetFilePath)).isTrue();
    }

    private void assertFileInfo(Long fileInfoId, MultipartFile file) {
        FileInfo fileInfo = fileInfoRepository.findById(fileInfoId).orElseThrow();
        assertThat(fileInfo.getOriginName()).isEqualTo(file.getOriginalFilename());
        assertThat(fileInfo.getExtension()).isEqualTo(Objects.requireNonNull(file.getOriginalFilename()).split("\\.")[1]);
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