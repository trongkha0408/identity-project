package com.trkha.identityservice.mapper;

import org.mapstruct.Mapper;

import com.trkha.identityservice.dto.request.PermissionRequest;
import com.trkha.identityservice.dto.response.PermissionResponse;
import com.trkha.identityservice.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
