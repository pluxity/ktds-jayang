package com.pluxity.ktds.domains.parking.dto;

import java.util.List;

public class ParkPoiApiDTOs {

    public record ParkPoisResponse(List<ParkPoiRes> pois) {}
    public record ParkPoiRes(String floorNm, String type, String sideType, String name, Double x, Double y) {}
}
