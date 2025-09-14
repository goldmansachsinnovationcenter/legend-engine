package org.finos.legend.engine.kafka.api;

import org.finos.legend.engine.kafka.api.model.ConsumerLagRequest;
import org.junit.Test;

import javax.ws.rs.core.Response;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.Assert.*;

public class TestKafkaConsumerLagApi
{
    private final KafkaConsumerLagApi api = new KafkaConsumerLagApi();

    @Test
    public void testValidationWithNullRequest()
    {
        Response response = api.getConsumerLag(null);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithEmptyBootstrapServers()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = Collections.emptyList();
        request.topicName = "test-topic";
        request.consumerGroupName = "test-group";

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithNullBootstrapServers()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = null;
        request.topicName = "test-topic";
        request.consumerGroupName = "test-group";

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithEmptyTopicName()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = Arrays.asList("localhost:9092");
        request.topicName = "";
        request.consumerGroupName = "test-group";

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithNullTopicName()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = Arrays.asList("localhost:9092");
        request.topicName = null;
        request.consumerGroupName = "test-group";

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithEmptyConsumerGroupName()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = Arrays.asList("localhost:9092");
        request.topicName = "test-topic";
        request.consumerGroupName = "";

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testValidationWithNullConsumerGroupName()
    {
        ConsumerLagRequest request = new ConsumerLagRequest();
        request.bootstrapServers = Arrays.asList("localhost:9092");
        request.topicName = "test-topic";
        request.consumerGroupName = null;

        Response response = api.getConsumerLag(request);
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }
}
