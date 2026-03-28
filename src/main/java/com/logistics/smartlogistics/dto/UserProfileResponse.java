package com.logistics.smartlogistics.dto;

import lombok.Builder;
import lombok.Data;



@Data
@Builder
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String mobile;
    private String role;

}