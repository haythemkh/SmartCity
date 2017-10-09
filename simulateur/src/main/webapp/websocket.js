var stompClient = null;

var urlWebsocket = '/websocket';

var date = null;
var chaineHeure = "Heure du système : ";

function connect() {
    var socket = new SockJS(urlWebsocket);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/date', function (obj) {
            if(obj.body !== ""){
                date = new Date(obj.body);
                dateAAfficher = "date et heure systeme : " + date.toLocaleDateString() + " | " + date.toLocaleTimeString();
                console.log(dateAAfficher);
                $("#span-heure").text(dateAAfficher);
            }
        });
    });     
}

function sendName() {
    stompClient.send("/app/hello", {}, "dddddd");
}

$(function () {
    connect();
});