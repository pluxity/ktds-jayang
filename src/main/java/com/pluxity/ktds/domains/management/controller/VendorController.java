package com.pluxity.ktds.domains.management.controller;

import com.pluxity.ktds.domains.management.dto.CreateVendorDTO;
import com.pluxity.ktds.domains.management.dto.UpdateVendorDTO;
import com.pluxity.ktds.domains.management.dto.VendorResponseDTO;
import com.pluxity.ktds.domains.management.service.VendorService;
import com.pluxity.ktds.global.constant.SuccessCode;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vendor")
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postVendor(
            @RequestBody CreateVendorDTO createVendorDTO) {
        vendorService.save(createVendorDTO);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @PutMapping("/{id}")
    public ResponseBody updateVendor(
            @PathVariable Long id,
            @RequestBody UpdateVendorDTO updateVendorDTO) {
        vendorService.updateVendor(id, updateVendorDTO);
        return ResponseBody.of(SUCCESS_PUT);
    }

    @GetMapping
    public DataResponseBody<List<VendorResponseDTO>> getAllVendors() {
        List<VendorResponseDTO> vendors = vendorService.findAll();
        return DataResponseBody.of(vendors);
    }

    @GetMapping("/{id}")
    public DataResponseBody<VendorResponseDTO> getVendor(@PathVariable Long id) {
        return DataResponseBody.of(vendorService.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseBody deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping("/id-list/{ids}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteVendorList(@PathVariable List<Long> ids) {
        vendorService.deleteAllById(ids);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
