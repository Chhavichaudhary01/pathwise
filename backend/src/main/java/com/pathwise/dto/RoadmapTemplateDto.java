package com.pathwise.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RoadmapTemplateDto {
    private String id;
    private String slug;
    private String name;
    private String role;
    private String category;
    private String type;
    private String tagline;
    private String description;
    private List<String> skills;
    private String level;
    private Double rating;
    private Integer upvotes;
    private String pricing;
    private String url;
    private String source;
    private Boolean verified;

    public RoadmapTemplateDto() {}

    public RoadmapTemplateDto(String id, String slug, String name, String role, String category, String type, 
                              String tagline, String description, List<String> skills, String level, 
                              Double rating, Integer upvotes, String pricing, String url, String source, Boolean verified) {
        this.id = id;
        this.slug = slug;
        this.name = name;
        this.role = role;
        this.category = category;
        this.type = type;
        this.tagline = tagline;
        this.description = description;
        this.skills = skills;
        this.level = level;
        this.rating = rating;
        this.upvotes = upvotes;
        this.pricing = pricing;
        this.url = url;
        this.source = source;
        this.verified = verified;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }

    public String getPricing() { return pricing; }
    public void setPricing(String pricing) { this.pricing = pricing; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }
}
