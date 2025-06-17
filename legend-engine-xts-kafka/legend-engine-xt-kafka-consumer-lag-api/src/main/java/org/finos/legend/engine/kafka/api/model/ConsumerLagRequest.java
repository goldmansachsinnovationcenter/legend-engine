package org.finos.legend.engine.kafka.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ConsumerLagRequest
{
    @JsonProperty("bootstrapServers")
    public List<String> bootstrapServers;
    
    @JsonProperty("topicName")
    public String topicName;
    
    @JsonProperty("consumerGroupName")
    public String consumerGroupName;
}
