package org.finos.legend.engine.kafka.api;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.ListConsumerGroupOffsetsResult;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.finos.legend.engine.kafka.api.model.ConsumerLagRequest;
import org.finos.legend.engine.kafka.api.model.ConsumerLagResponse;
import org.finos.legend.engine.kafka.api.model.PartitionLag;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Api(tags = "Kafka Consumer Lag")
@Path("kafka/consumer-lag")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class KafkaConsumerLagApi
{
    @POST
    @ApiOperation(value = "Check Kafka consumer lag for a given topic and consumer group")
    public Response getConsumerLag(
            @ApiParam("Consumer lag request") ConsumerLagRequest request)
    {
        try
        {
            validateRequest(request);
            
            Properties adminProps = new Properties();
            adminProps.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, String.join(",", request.bootstrapServers));
            adminProps.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000);
            adminProps.put(AdminClientConfig.DEFAULT_API_TIMEOUT_MS_CONFIG, 30000);
            
            try (AdminClient adminClient = AdminClient.create(adminProps))
            {
                Map<TopicPartition, Long> endOffsets = getTopicEndOffsets(adminClient, request.topicName);
                Map<TopicPartition, Long> consumerOffsets = getConsumerGroupOffsets(adminClient, request.consumerGroupName, request.topicName);
                
                List<PartitionLag> partitionLags = calculateLag(endOffsets, consumerOffsets);
                
                ConsumerLagResponse response = new ConsumerLagResponse();
                response.topicName = request.topicName;
                response.consumerGroupName = request.consumerGroupName;
                response.partitionLags = partitionLags;
                response.totalLag = partitionLags.stream().mapToLong(p -> p.lag).sum();
                
                return Response.ok(response).build();
            }
        }
        catch (IllegalArgumentException e)
        {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Collections.singletonMap("error", e.getMessage()))
                    .build();
        }
        catch (Exception e)
        {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Collections.singletonMap("error", "Failed to retrieve consumer lag: " + e.getMessage()))
                    .build();
        }
    }
    
    private void validateRequest(ConsumerLagRequest request)
    {
        if (request == null)
        {
            throw new IllegalArgumentException("Request cannot be null");
        }
        if (request.bootstrapServers == null || request.bootstrapServers.isEmpty())
        {
            throw new IllegalArgumentException("Bootstrap servers cannot be null or empty");
        }
        if (request.topicName == null || request.topicName.trim().isEmpty())
        {
            throw new IllegalArgumentException("Topic name cannot be null or empty");
        }
        if (request.consumerGroupName == null || request.consumerGroupName.trim().isEmpty())
        {
            throw new IllegalArgumentException("Consumer group name cannot be null or empty");
        }
    }
    
    private Map<TopicPartition, Long> getTopicEndOffsets(AdminClient adminClient, String topicName) 
            throws ExecutionException, InterruptedException
    {
        Set<TopicPartition> topicPartitions = adminClient.describeTopics(Collections.singleton(topicName))
                .all()
                .get()
                .get(topicName)
                .partitions()
                .stream()
                .map(partitionInfo -> new TopicPartition(topicName, partitionInfo.partition()))
                .collect(java.util.stream.Collectors.toSet());
        
        return adminClient.listOffsets(
                topicPartitions.stream()
                        .collect(java.util.stream.Collectors.toMap(
                                tp -> tp,
                                tp -> org.apache.kafka.clients.admin.OffsetSpec.latest()
                        ))
        ).all().get()
                .entrySet()
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().offset()
                ));
    }
    
    private Map<TopicPartition, Long> getConsumerGroupOffsets(AdminClient adminClient, String consumerGroupName, String topicName)
            throws ExecutionException, InterruptedException
    {
        ListConsumerGroupOffsetsResult offsetsResult = adminClient.listConsumerGroupOffsets(consumerGroupName);
        Map<TopicPartition, OffsetAndMetadata> offsets = offsetsResult.partitionsToOffsetAndMetadata().get();
        
        return offsets.entrySet()
                .stream()
                .filter(entry -> entry.getKey().topic().equals(topicName))
                .collect(java.util.stream.Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().offset()
                ));
    }
    
    private List<PartitionLag> calculateLag(Map<TopicPartition, Long> endOffsets, Map<TopicPartition, Long> consumerOffsets)
    {
        List<PartitionLag> partitionLags = new ArrayList<>();
        
        for (Map.Entry<TopicPartition, Long> endOffsetEntry : endOffsets.entrySet())
        {
            TopicPartition partition = endOffsetEntry.getKey();
            long endOffset = endOffsetEntry.getValue();
            long consumerOffset = consumerOffsets.getOrDefault(partition, 0L);
            long lag = Math.max(0, endOffset - consumerOffset);
            
            PartitionLag partitionLag = new PartitionLag();
            partitionLag.partition = partition.partition();
            partitionLag.endOffset = endOffset;
            partitionLag.consumerOffset = consumerOffset;
            partitionLag.lag = lag;
            
            partitionLags.add(partitionLag);
        }
        
        return partitionLags;
    }
}
