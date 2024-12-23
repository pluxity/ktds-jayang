package com.pluxity.ktds.domains.building.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.pluxity.ktds.CreateDomain;
import com.pluxity.ktds.domains.building.dto.BuildingDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.BuildingResponseDTO;
import com.pluxity.ktds.domains.building.dto.CreateBuildingDTO;
import com.pluxity.ktds.domains.building.dto.UpdateBuildingDTO;
import com.pluxity.ktds.domains.building.entity.LodSettings;
import com.pluxity.ktds.domains.building.service.BuildingService;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import com.pluxity.ktds.domains.poi_set.repository.PoiSetRepository;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.plx_file.repository.FileInfoRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders;
import org.springframework.restdocs.payload.JsonFieldType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import static com.pluxity.ktds.ApiDocumentUtils.getDocumentRequest;
import static com.pluxity.ktds.ApiDocumentUtils.getDocumentResponse;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestDocs
@ExtendWith({MockitoExtension.class, RestDocumentationExtension.class})
@Transactional
class BuildingControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    BuildingService buildingService;

    @InjectMocks
    BuildingController buildingController;

    @Autowired
    CreateDomain createDomain;

    @Autowired
    EntityManager em;

    ObjectMapper objectMapper;
    @Autowired
    private FileInfoRepository fileInfoRepository;

    @Autowired
    private PoiSetRepository poiSetRepository;

    @BeforeEach
    public void setUp() {
        objectMapper = new ObjectMapper();

        Long fileInfoId;
        try {
            Path zipFilePath = Paths.get("src", "test", "resources", "building.zip");
            byte[] fileContent = Files.readAllBytes(zipFilePath);
            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    zipFilePath.getFileName().toString(),
                    "application/zip",
                    fileContent);

            fileInfoId = buildingService.saveFile(file).id();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        PoiSet poiSet = PoiSet.builder()
                .name(CreateDomain.generateUUID())
                .build();

        Long poiSetId = poiSetRepository.save(poiSet).getId();

        CreateBuildingDTO createBuildingDTO = CreateBuildingDTO.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfoId)
                .poiSetId(poiSetId)
                .build();

        buildingService.saveBuilding(createBuildingDTO);

    }

    @Test
    @DisplayName("GET /buildings - success")
    void testGetBuildingsSuccess() throws Exception {

        List<BuildingResponseDTO> buildingResponseDtos = buildingService.findAll();
        BuildingResponseDTO dto = buildingResponseDtos.get(0);
        int id = Math.toIntExact(dto.id());
        String code = dto.code();
        String name = dto.name();

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/buildings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").exists())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        responseFields(
                                fieldWithPath("timestamp").type(JsonFieldType.STRING).description("시간"),
                                fieldWithPath("status").type(JsonFieldType.STRING).description("상태"),
                                fieldWithPath("message").type(JsonFieldType.STRING).description("메세지"),
                                fieldWithPath("data[].id").type(JsonFieldType.NUMBER).description("id"),
                                fieldWithPath("data[].code").type(JsonFieldType.STRING).description("도면코드"),
                                fieldWithPath("data[].name").type(JsonFieldType.STRING).description("도면명"),
                                fieldWithPath("data[].description").type(JsonFieldType.STRING).description("설명")
                        )
                ))
                .andReturn();

        String jsonResponse = result.getResponse().getContentAsString();

        assertThat(JsonPath.<List<Object>>read(jsonResponse, "$.data")).hasSize(1);
        assertThat(JsonPath.<Integer>read(jsonResponse, "$.data[0].id")).isEqualTo(id);
        assertThat(JsonPath.<String>read(jsonResponse, "$.data[0].code")).isEqualTo(code);
        assertThat(JsonPath.<String>read(jsonResponse, "$.data[0].name")).isEqualTo(name);

    }

    @Test
    @DisplayName("GET /buildings/{id} - success")
    void testGetBuildingByIdSuccess() throws Exception {

    }

    @Test
    @DisplayName("PATCH /buildings/{id}/force - success")
    void testUpdateBuildingForceSuccess() throws Exception {
        FileInfo fileInfo = fileInfoRepository.findAll().get(0);
        PoiSet poiSet = poiSetRepository.findAll().get(0);
        CreateBuildingDTO BuildingRequestDTO = CreateBuildingDTO.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfo.getId())
                .poiSetId(poiSet.getId())
                .build();

        Long savedId = buildingService.saveBuilding(BuildingRequestDTO);
        BuildingDetailResponseDTO buildingDto = buildingService.findById(savedId);

        UpdateBuildingDTO updatedBuilding = UpdateBuildingDTO.builder()
                .code(BuildingRequestDTO.code())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(buildingDto.buildingFile().id())
                .poiSetId(buildingDto.poiSetId())
                .build();

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/buildings/{id}/force", savedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBuilding)))
                .andExpect(status().isAccepted())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        pathParameters(
                            parameterWithName("id").description("도면Id")
                        ),
                        requestFields(
                                fieldWithPath("code").type(JsonFieldType.STRING).description("도면코드"),
                                fieldWithPath("name").type(JsonFieldType.STRING).description("도면명"),
                                fieldWithPath("description").type(JsonFieldType.STRING).description("설명"),
                                fieldWithPath("fileInfoId").type(JsonFieldType.NUMBER).description("도면파일Id").optional(),
                                fieldWithPath("poiSetId").type(JsonFieldType.NUMBER).description("poiSetId"),
                                fieldWithPath("lodSettings").type(JsonFieldType.OBJECT).description("lod설정값").optional(),
                                fieldWithPath("topology").type(JsonFieldType.STRING).description("토폴로지").optional()
                        )
                ))
        ;

        BuildingDetailResponseDTO updatedBuildingDto = buildingService.findById(savedId);
        assertThat(updatedBuildingDto.code()).isEqualTo(updatedBuilding.code());
        assertThat(updatedBuildingDto.name()).isEqualTo(updatedBuilding.name());
        assertThat(updatedBuildingDto.description()).isEqualTo(updatedBuilding.description());
    }

    @Test
    @DisplayName("PUT /buildings/{id} - success")
    void testUpdateBuildingSuccess() throws Exception {
        FileInfo fileInfo = fileInfoRepository.findAll().get(0);
        PoiSet poiSet = poiSetRepository.findAll().get(0);
        CreateBuildingDTO createBuildingDTO = CreateBuildingDTO.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfo.getId())
                .poiSetId(poiSet.getId())
                .build();

        Long savedId = buildingService.saveBuilding(createBuildingDTO);
        BuildingDetailResponseDTO buildingDto = buildingService.findById(savedId);

        CreateBuildingDTO updatedBuilding = CreateBuildingDTO.builder()
                .code(createBuildingDTO.code())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(buildingDto.buildingFile().id())
                .poiSetId(createBuildingDTO.poiSetId())
                .build();

        mockMvc.perform(RestDocumentationRequestBuilders.put("/buildings/{id}", savedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedBuilding)))
                .andExpect(status().isNoContent())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        pathParameters(
                                parameterWithName("id").description("도면Id")
                        ),
                        requestFields(
                                fieldWithPath("code").type(JsonFieldType.STRING).description("도면코드"),
                                fieldWithPath("name").type(JsonFieldType.STRING).description("도면명"),
                                fieldWithPath("description").type(JsonFieldType.STRING).description("설명"),
                                fieldWithPath("fileInfoId").type(JsonFieldType.NUMBER).description("도면파일Id").optional(),
                                fieldWithPath("poiSetId").type(JsonFieldType.NUMBER).description("poiSetId"),
                                fieldWithPath("lodSettings").type(JsonFieldType.OBJECT).description("lod설정값").optional(),
                                fieldWithPath("topology").type(JsonFieldType.STRING).description("토폴로지").optional()
                        )
                ));

        BuildingDetailResponseDTO updatedBuildingDto = buildingService.findById(savedId);
        assertThat(updatedBuildingDto.code()).isEqualTo(updatedBuilding.code());
        assertThat(updatedBuildingDto.name()).isEqualTo(updatedBuilding.name());
        assertThat(updatedBuildingDto.description()).isEqualTo(updatedBuilding.description());
    }

    @Test
    @DisplayName("PATCH /buildings/{id}/lod - success")
    void testUpdateBuildingLodSuccess() throws Exception {
        FileInfo fileInfo = fileInfoRepository.findAll().get(0);
        PoiSet poiSet = poiSetRepository.findAll().get(0);
        CreateBuildingDTO createBuildingDTO = CreateBuildingDTO.builder()
                .code(CreateDomain.generateUUID())
                .name(CreateDomain.generateUUID())
                .description(CreateDomain.generateUUID())
                .fileInfoId(fileInfo.getId())
                .poiSetId(poiSet.getId())
                .build();

        Long savedId = buildingService.saveBuilding(createBuildingDTO);

        LodSettings lodSettings = LodSettings.builder()
                .lodCount(1L)
                .lodData(UUID.randomUUID().toString())
                .lodMaxDistance(123.456)
                .build();

        mockMvc.perform(RestDocumentationRequestBuilders.patch("/buildings/{id}/lod", savedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(lodSettings)))
                .andExpect(status().isAccepted())
                .andDo(document("{class-name}/{method-name}",
                        getDocumentRequest(),
                        getDocumentResponse(),
                        pathParameters(
                                parameterWithName("id").description("도면Id")
                        ),
                        requestFields(
                                fieldWithPath("lodMaxDistance").type(JsonFieldType.NUMBER).description("카메라최장거리").optional(),
                                fieldWithPath("lodCount").type(JsonFieldType.NUMBER).description("LOD레벨수").optional(),
                                fieldWithPath("lodData").type(JsonFieldType.STRING).description("LOD데이터").optional()
                        )
                ));

        BuildingDetailResponseDTO updatedBuildingDto = buildingService.findById(savedId);
        assertThat(updatedBuildingDto.lodSettings().getLodCount()).isEqualTo(lodSettings.getLodCount());
        assertThat(updatedBuildingDto.lodSettings().getLodData()).isEqualTo(lodSettings.getLodData());
        assertThat(updatedBuildingDto.lodSettings().getLodMaxDistance()).isEqualTo(lodSettings.getLodMaxDistance());
    }


}
