# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

# User specific aliases and functions

#KAFKA
export KAFKA_HOME=/usr/local/src/kafka
export KAFKA_BIN=$KAFKA_HOME/bin

#SCALA
export SCALA_HOME=/usr/local/src/scala
export SCALA_BIN=$SCALA_HOME/bin

#JAVA
export JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.144-0.b01.el7_4.x86_64

#HADOOP
export HADOOP_HOME=/usr/local/src/hadoop
export HADOOP_MAPRED_HOME=$HADOOP_HOME
export HADOOP_COMMON_HOME=$HADOOP_HOME
export HADOOP_HDFS_HOME=$HADOOP_HOME
export YARN_HOME=$HADOOP_HOME
export HADOOP_COMMON_LIB_NATIVE_DIR=$HADOOP_HOME/lib/native
export HADOOP_INSTALL=$HADOOP_HOME

#SPARK
export SPARK_HOME=/usr/local/src/spark
export SPARK_BIN=$SPARK_HOME/bin

#FLUME
export FLUME_HOME=/usr/local/src/flume
export FLUME_BIN=$FLUME_HOME/bin
export FLUME_CLASSPATH=/usr/local/src/flume/classpath_lib

#PATH
export PATH=$PATH:$KAFKA_BIN:$SCALA_BIN:$JAVA_HOME/jre/bin:$SPARK_BIN:$HADOOP_HOME/sbin:$HADOOP_HOME/bin:$FLUME_BIN
