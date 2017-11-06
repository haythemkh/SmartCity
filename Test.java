import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonValue;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.function.Function;
import org.apache.spark.api.java.function.PairFunction;
import org.apache.spark.api.java.function.VoidFunction;
import org.apache.spark.streaming.Durations;
import org.apache.spark.streaming.api.java.JavaDStream;
import org.apache.spark.streaming.api.java.JavaInputDStream;
import org.apache.spark.streaming.api.java.JavaPairDStream;
import org.apache.spark.streaming.api.java.JavaStreamingContext;
import org.apache.spark.streaming.kafka010.ConsumerStrategies;
import org.apache.spark.streaming.kafka010.KafkaUtils;
import org.apache.spark.streaming.kafka010.LocationStrategies;
import scala.Tuple2;
import scala.Tuple3;


public class Test {

	public static String kafkaBrokers = "localhost:9092";
	public static long frequenceReception = 60000;
	public static String TOPIC_RECEPTION = "conso-maisons";
	public static String TOPIC_EMISSION = "conso-quartiers";
	public static String SEPARATEUR = ",";
	public static String fichierDestination = "log.txt";

	public static int frequence = 1;



	public static void main(String[] args) {

		try{

			String nomApplication = "AggregationParQuartier";
			String brokers = kafkaBrokers;

			// Create context with a 2 seconds batch interval
			SparkConf sparkConf = new SparkConf().setAppName(nomApplication);
			JavaStreamingContext jssc = new JavaStreamingContext(sparkConf, Durations.seconds(frequence));


			Properties kafkaProducerProps = new Properties();
			kafkaProducerProps.put("bootstrap.servers", brokers);
			kafkaProducerProps.put("acks", "all");
			kafkaProducerProps.put("retries", 0);
			kafkaProducerProps.put("batch.size", 16384);
			kafkaProducerProps.put("linger.ms", 1);
			kafkaProducerProps.put("buffer.memory", 33554432);
			kafkaProducerProps.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
			kafkaProducerProps.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");


			Map<String, Object> kafkaParams = new HashMap<>();
			kafkaParams.put("bootstrap.servers", brokers);
			kafkaParams.put("key.deserializer", StringDeserializer.class);
			kafkaParams.put("value.deserializer", StringDeserializer.class);
			kafkaParams.put("group.id", nomApplication);
			kafkaParams.put("auto.offset.reset", "latest");
			kafkaParams.put("enable.auto.commit", true);

			Collection<String> topics = Arrays.asList(TOPIC_RECEPTION);

			// Create direct kafka stream with brokers and topics
			final JavaInputDStream<ConsumerRecord<String, String>> messages
			= KafkaUtils.createDirectStream(
					jssc,
					LocationStrategies.PreferConsistent(),
					ConsumerStrategies.<String, String>Subscribe(topics, kafkaParams)
					);

			File fileDestination = new File("donnees.txt");
			boolean bool = fileDestination.createNewFile();        
			FileOutputStream fichierDest = new FileOutputStream(fileDestination);        
			Path pathSource = FileSystems.getDefault().getPath(fichierDestination,"/part-00000");

			messages.map(new Function<ConsumerRecord<String, String>, String>(){
				@Override
				public String call(ConsumerRecord<String, String> record) throws Exception {
					return record.value();
				}
			}).foreachRDD(new VoidFunction<JavaRDD<String>>(){
				@Override
				public void call(JavaRDD<String> rdd) throws Exception {
					rdd.saveAsTextFile(fichierDestination);//Sauvegarde le RDD dans un fichier
				}
			});
			//OU ENCORE
			JavaPairDStream<LocalDateTime, Tuple3<Integer, String, Double>> lignes = messages.mapToPair(
					new PairFunction<ConsumerRecord<String, String>, LocalDateTime, Tuple3<Integer, String, Double>>() {
						@Override
						public Tuple2<LocalDateTime, Tuple3<Integer, String, Double>> call(ConsumerRecord<String, String> record) {
							String[] donnees = record.value().split(SEPARATEUR);
							LocalDateTime date = LocalDateTime.parse(donnees[0]);
							Integer idQuartier = Integer.parseInt(donnees[1]);
							String nomQuartier = donnees[2];
							//POSSIBILITE DE FAIRE UN PRINT ICI
							double conso = Double.parseDouble(donnees[4]);
							return new Tuple2<>(date, new Tuple3<>(idQuartier, nomQuartier, conso));
						}
					});
			// Start the computation
			jssc.start();
			try {
				jssc.awaitTermination();
			} catch (InterruptedException ex) {
				Logger.getLogger(SparkStreamingProcessing.class.getName()).log(Level.SEVERE, null, ex);
			}

		}catch(Exception e){
			e.printStackTrace();	
		}
	}    

}
