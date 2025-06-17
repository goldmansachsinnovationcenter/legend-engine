package org.finos.legend.engine.kafka.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ConsumerLagResponse
{
    @JsonProperty("topicName")
    public String topicName;
    
    @JsonProperty("consumerGroupName")
    public String consumerGroupName;
    
    @JsonProperty("partitionLags")
    public List<PartitionLag> partitionLags;
    
    @JsonProperty("totalLag")
    public long totalLag;
}
