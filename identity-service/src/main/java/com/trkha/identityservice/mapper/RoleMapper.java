package com.trkha.identityservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.trkha.identityservice.dto.request.RoleRequest;
import com.trkha.identityservice.dto.response.RoleResponse;
import com.trkha.identityservice.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
