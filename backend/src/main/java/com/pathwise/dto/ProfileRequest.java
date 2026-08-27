package com.pathwise.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

@Data
public class ProfileRequest {
    private String goal;
    private String avatarUrl;
    private Integer age;
    private String classGrade;
    private String board;
    private String address;
    private Boolean isProfileComplete;
    private Object currentSkills;
    private Object interests;
    private Object learningHistory;
    private Integer weeklyHours;
    private String learningStyle;

    public String getCurrentSkillsJson(ObjectMapper mapper) {
        return toJsonString(currentSkills, mapper);
    }

    public String getInterestsJson(ObjectMapper mapper) {
        return toJsonString(interests, mapper);
    }

    public String getLearningHistoryJson(ObjectMapper mapper) {
        return toJsonString(learningHistory, mapper);
    }

    private String toJsonString(Object obj, ObjectMapper mapper) {
        if (obj == null) return "[]";
        if (obj instanceof String s) return s;
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}
