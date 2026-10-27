package com.cinema.booking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Bật tác vụ định kỳ giải phóng hold và đơn chờ đã hết hạn. */
@Configuration
@EnableScheduling
public class SchedulerConfig {}
