import org.apache.kafka.common.serialization.StringDeserializer
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.streaming.kafka010._
import org.apache.spark.streaming.kafka010.LocationStrategies.PreferConsistent
import org.apache.spark.streaming.kafka010.ConsumerStrategies.Subscribe
import org.apache.spark.streaming._
import org.elasticsearch.spark._
import scala.util.parsing.json.JSONObject

object SmartCity {
  def main(args: Array[String]) {

  val conf = new SparkConf().setAppName("SmartCity").setMaster("local[*]")
    .set("es.index.auto.create", "true")
    .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
    .set("es.nodes",args(1))
  val sc = new SparkContext(conf)
  val ssc = new StreamingContext(sc , Seconds(1))

  val kafkaParams = Map[String, Object](
     "bootstrap.servers" -> args(2).concat(":9092"),
     "key.deserializer" -> classOf[StringDeserializer],
     "value.deserializer" -> classOf[StringDeserializer],
     "group.id" -> "my_group_id",
     "auto.offset.reset" -> "latest",
     "enable.auto.commit" -> (false: java.lang.Boolean)
    )

    val topics = Array("conso-maisons", "test")
    val stream = KafkaUtils.createDirectStream(
      ssc,
      PreferConsistent,
      Subscribe[String, String](topics, kafkaParams)
    )
  // list des quartiers VIP
  val vipList = sc.textFile((args(0)))
  // determine si un quartiers est VIP
  val vipString = vipList.reduce((a,b)=>a+b)
  def isVip( a:String) : Boolean = {
    return (a.split(",").exists(b => vipString.contains(b)))
  }
  def add(line:String , b:Boolean): String ={
    if(line.isEmpty()){
      return ""
    }
    if(b) {
      var x =line.concat(",yes")
      return x
    }
    else{
      var x = line.concat(",no")
      return x
    }
  }

  val splitRdd = stream.map(l => add(l.value(),isVip(l.value()))).map(l=>l.split(","))
  val finalRdd = splitRdd.map(l => JSONObject(Map(
      "date"         -> (l(0)),
      "idQuartier"   -> Integer.parseInt(l(1)),
      "nomQuartier"  -> l(2),
      "idMaison"     -> Integer.parseInt(l(3)),
      "conso"        -> l(4).toDouble,
      "vip"          -> l(5)
    ))
    ).foreachRDD(l => l.saveToEs("spark/docs"))
    ssc.start()
    ssc.awaitTermination()
  }
}



