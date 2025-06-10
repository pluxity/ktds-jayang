package com.pluxity.ktds.global.utils;

import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExcelUtil {

    private static String getCellValue(XSSFCell cell) {

        String value = "";

        if (cell == null) {
            return value;
        }

        switch (cell.getCellType()) {
            case STRING:
                value = cell.getStringCellValue();
                break;
            case NUMERIC:
                double dou = cell.getNumericCellValue();
                if( dou == (long) dou) {
                    value = (int) cell.getNumericCellValue() + "";
                } else {
                    value = (float) cell.getNumericCellValue() + "";
                }

                break;
            default:
                break;
        }
        return value;
    }

    public static List<Map<String, Object>> readExcel(MultipartFile excelFile) throws IOException {


        XSSFWorkbook workbook = new XSSFWorkbook(excelFile.getInputStream());
        XSSFSheet sheet;
        XSSFRow curRow;

        //첫번째 시트 읽어오기
        sheet = workbook.getSheetAt(0);

        //행의 개수
        int rownum = sheet.getPhysicalNumberOfRows();
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for (int rowIndex = 0; rowIndex < rownum; rowIndex++) {

            Map<String, Object> map = new HashMap<String, Object>();

            curRow = sheet.getRow(rowIndex);

            if (curRow != null) {
                //열의 개수
                int cellnum = curRow.getPhysicalNumberOfCells();

                for (int columnIndex = 0; columnIndex <= cellnum; columnIndex++) {
                    XSSFCell cell = curRow.getCell(columnIndex);
                    if (cell == null) {
                        continue;
                    } else {
                        map.put(String.valueOf(columnIndex), getCellValue(cell));
                    }
                }


                result.add(map);
            }

        }

        return result;

    }

    public static List<Map<String, Object>> readExcelBatch(MultipartFile excelFile) throws IOException {

        XSSFWorkbook workbook = new XSSFWorkbook(excelFile.getInputStream());
        XSSFSheet sheet;
        XSSFRow currentRow;

        //첫번째 시트 읽어오기
        sheet = workbook.getSheetAt(0);

        //행의 개수
        int numberOfRows = sheet.getPhysicalNumberOfRows();
        //열의 개수
        currentRow = sheet.getRow(0);

        int columnSize = currentRow.getPhysicalNumberOfCells();
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();

        for (int rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            Map<String, Object> map = new HashMap<String, Object>();

            //현재 행 가져오기
            currentRow = sheet.getRow(rowIndex);
            if (currentRow != null) {
                int count = 0;
                for (int columnIndex = 0; columnIndex < columnSize; columnIndex++) {
                    XSSFCell cell = currentRow.getCell(columnIndex);
                    //행에 해당하는 cell 내용 저장
                    String key = String.valueOf(columnIndex);
                    map.put(key, getCellValue(cell));

                    //Row의 공백 count
                    if(!validString(getCellValue(cell))){
                        count++;
                    }
                }

                //모든 열이 비어있으면 return
                if(count == columnSize){
                    return result;
                }

                //저장된 행을 result에 저장
                result.add(map);
            }
        }
        return result;
    }

    public static List<Map<String, Object>> readExcelBatchKiosk(MultipartFile excelFile, int isKiosk) throws IOException {
        XSSFWorkbook workbook = new XSSFWorkbook(excelFile.getInputStream());
        XSSFSheet sheet;
        XSSFRow currentRow;

        //첫번째 시트 읽어오기
        sheet = workbook.getSheetAt(isKiosk);

        //행의 개수
        int numberOfRows = sheet.getPhysicalNumberOfRows();
        //열의 개수
        currentRow = sheet.getRow(0);

        int columnSize = currentRow.getPhysicalNumberOfCells();
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();

        for (int rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            Map<String, Object> map = new HashMap<String, Object>();

            //현재 행 가져오기
            currentRow = sheet.getRow(rowIndex);
            if (currentRow != null) {
                int count = 0;
                for (int columnIndex = 0; columnIndex < columnSize; columnIndex++) {
                    XSSFCell cell = currentRow.getCell(columnIndex);
                    //행에 해당하는 cell 내용 저장
                    String key = String.valueOf(columnIndex);
                    map.put(key, getCellValue(cell));

                    //Row의 공백 count
                    if(!validString(getCellValue(cell))){
                        count++;
                    }
                }

                //모든 열이 비어있으면 return
                if(count == columnSize){
                    return result;
                }

                //저장된 행을 result에 저장
                result.add(map);
            }
        }
        return result;
    }

    private static boolean validString(String str) {
        return str != null && !str.isBlank();
    }
}
