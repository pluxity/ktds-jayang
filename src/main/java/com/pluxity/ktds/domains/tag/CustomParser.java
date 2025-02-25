package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.configurationprocessor.json.JSONObject;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CustomParser {

    public static String fixedJson2(String json) {
        json = json.trim();
        // 외부 중괄호 제거
        if (json.startsWith("{") && json.endsWith("}")) {
            json = json.substring(1, json.length() - 1);
        }
        // 따옴표 내부 쉼표를 무시하면서 분리하는 정규표현식 사용
        String[] tokens = json.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        StringBuilder result = new StringBuilder("{");
        boolean first = true;

        for (String token : tokens) {
            token = token.trim();
            if (token.isEmpty()) continue;

            if (!token.contains(":") || token.startsWith(":")) {
                token = "\"E\":" + (token.startsWith(":") ? token.substring(1) : token);
            }
            if (!first) result.append(",");
            result.append(token);
            first = false;
        }
        result.append("}");
        return result.toString();
    }
    public static String fixedJson(String json) {
        return json.replaceAll("(?<=\\{|,)\\s*(\"[^\"]*\")\\s*(?=,|\\})", "\"E\":$1");
    }

}
