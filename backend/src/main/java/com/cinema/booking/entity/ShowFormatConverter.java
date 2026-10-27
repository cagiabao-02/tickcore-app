package com.cinema.booking.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Ánh xạ enum Java sang mã định dạng công khai 2D/3D/IMAX trong MySQL. */
@Converter
public class ShowFormatConverter implements AttributeConverter<ShowFormat, String> {
    @Override
    public String convertToDatabaseColumn(ShowFormat format) {
        return format == null ? null : format.getCode();
    }

    @Override
    public ShowFormat convertToEntityAttribute(String code) {
        return code == null ? null : ShowFormat.fromCode(code);
    }
}
