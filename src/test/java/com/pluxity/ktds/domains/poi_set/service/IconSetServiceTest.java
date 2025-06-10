package com.pluxity.ktds.domains.poi_set.service;

import com.pluxity.ktds.domains.poi_set.dto.IconSetFileRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDto;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDto;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.repository.IconSetRepository;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.NoSuchElementException;

import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON2D;
import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON3D;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class IconSetServiceTest {

    @Autowired
    IconSetService service;

    @Autowired
    IconSetRepository repository;

    @Autowired
    SaveImage imageStrategy;

    @Autowired
    SaveZipFile zipStrategy;


    private Long save2DFile() throws IOException {
        Path path = Paths.get("src", "test", "resources", "2dIcon.png");
        byte[] fileContent = Files.readAllBytes(path);
        MultipartFile multipartFile = new MockMultipartFile("file", path.getFileName().toString(), "image/png", fileContent);

        IconSetFileRequestDto dto = IconSetFileRequestDto.builder()
                .type(ICON2D)
                .strategy(imageStrategy)
                .file(multipartFile)
                .build();

        return service.saveIconFile(dto).id();
    }

    private Long save3DFile() throws IOException {
        Path path = Paths.get("src", "test", "resources", "3dIcon.zip");
        byte[] fileContent = Files.readAllBytes(path);
        MultipartFile multipartFile = new MockMultipartFile("file", path.getFileName().toString(), "application/zip", fileContent);

        IconSetFileRequestDto dto = IconSetFileRequestDto.builder()
                .type(ICON3D)
                .strategy(zipStrategy)
                .file(multipartFile)
                .build();

        return service.saveIconFile(dto).id();
    }

    IconSet save(final String name) throws IOException {
        Long fileInfoId2D = save2DFile();
        Long fileInfoId3D = save3DFile();

        IconSetRequestDto requestDto = new IconSetRequestDto(name, fileInfoId2D, fileInfoId3D);
        Long id = service.save(requestDto);

        return repository.findById(id).orElseThrow();
    }

    @Test
    void 저장() throws IOException {

        Long fileInfoId2D = save2DFile();
        Long fileInfoId3D = save3DFile();

        final String iconSetName = "아이콘셋_01";
        IconSetRequestDto requestDto = new IconSetRequestDto(iconSetName, fileInfoId2D, fileInfoId3D);
        Long id = service.save(requestDto);

        repository.flush();

        IconSet fetchIconSet = repository.findById(id).orElseThrow();

        assertThat(fetchIconSet.getName()).isEqualTo("아이콘셋_01");
    }

    @Test
    void 저장_예외() throws IOException {

        Long fileInfoId2D = save2DFile();
        Long fileInfoId3D = save3DFile();

        final String iconSetName = "아이콘셋_01";
        IconSetRequestDto requestDto = new IconSetRequestDto(iconSetName, fileInfoId2D, fileInfoId3D);

        service.save(requestDto);

        repository.flush();

        CustomException exception = assertThrows(CustomException.class, () -> {
            final String duplicateName = "아이콘셋_01";
            IconSetRequestDto duplicateDto = new IconSetRequestDto(duplicateName, fileInfoId2D, fileInfoId3D);
            service.save(duplicateDto);
        });

        assertThat(exception.getErrorCode().getMessage()).isEqualTo("이미 존재하는 이름 입니다.");
    }

    @Test
    void 검색_ID() throws IOException {

        IconSet entity = this.save("아이콘셋_01");

//        repository.flush();

        IconSetResponseDto dto = service.findById(entity.getId());
        assertThat(dto.name()).isEqualTo("아이콘셋_01");
    }

    @Test
    void 검색_전체() throws IOException {
        this.save("아이콘셋_01");
        this.save("아이콘셋_02");
        this.save("아이콘셋_03");

        repository.flush();

        List<IconSetResponseDto> dtoList = service.findAll();

        assertThat(dtoList.size()).isEqualTo(3);
        assertThat(dtoList.get(0).name()).isEqualTo("아이콘셋_01");
        assertThat(dtoList.get(1).name()).isEqualTo("아이콘셋_02");
        assertThat(dtoList.get(2).name()).isEqualTo("아이콘셋_03");
    }


    @Test
    void 삭제() throws IOException {
        IconSet iconSet = this.save("아이콘셋_01");

        repository.flush();

        Long id = iconSet.getId();

        service.delete(id);
        Exception exception = assertThrows(NoSuchElementException.class, () -> repository.findById(id).orElseThrow());

        String expect = "No value present";

        assertTrue(exception.getMessage().contains(expect));
    }

    @Test
    void 수정() throws IOException {
        IconSet iconSet = this.save("아이콘셋_01");

        Long id = iconSet.getId();
        IconSetRequestDto updateIconSet = IconSetRequestDto.builder()
                .name("수정된 아이콘셋 이름")
                .build();

        service.update(id, updateIconSet);

        repository.flush();

        IconSet fetchIconSet = repository.findById(id).orElseThrow();

        assertThat(fetchIconSet.getName()).isEqualTo("수정된 아이콘셋 이름");
    }
}

