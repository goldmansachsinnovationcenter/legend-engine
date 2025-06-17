package org.finos.legend.engine.kafka.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PartitionLag
{
    @JsonProperty("partition")
    public int partition;
    
    @JsonProperty("endOffset")
    public long endOffset;
    
    @JsonProperty("consumerOffset")
    public long consumerOffset;
    
    @JsonProperty("lag")
    public long lag;
}
