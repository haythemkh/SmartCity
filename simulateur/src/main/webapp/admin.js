// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', ['ng-admin', 'ui.router']);
var baseApiUrl = 'api/';
var testControllerTemplate =
        '<div class="row"><div class="col-lg-12">' +
        '<ma-view-actions><ma-back-button></ma-back-button></ma-view-actions>' +
        '<div class="page-header">' +
        '<h1>Send post #{{ controller.postId }} by email</h1>' +
        '</div>' +
        '</div></div>' +
        '<div class="row">' +
        '<div class="col-lg-5"><input type="text" size="10" ng-model="controller.email" class="form-control" placeholder="name@example.com"/></div>' +
        '<div class="col-lg-5"><a class="btn btn-default" ng-click="controller.sendEmail()">Send</a></div>' +
        '</div>';

var customHeaderTemplate = 
        '<div class="navbar-header bg-primary" style="float: none;">' +
            '<div class="row">' +
                '<div class="col-md-6">' +
                    '<a class="navbar-brand" style="color: #fff;" href="#" ng-click="appController.displayHome()">' +
                            'Projet de Cloud - Génération des données' + 
                    '</a>' +
                '</div>' +
                '<div class="col-md-6">' +
                    '<div class="pull-right" style="padding: 20px;">' +
                        '<span data-toggle="tooltip" title="Heure du système" id="span-heure"> </span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

myApp.run(['$rootScope', '$http', function ($rootScope, $http) {
    $http({
        method: "GET",
        url: baseApiUrl + "globale/generation/encours"
    }).then(function succes(response) {
        $rootScope.simulationEnCours = response.data.obj;
    }, function error(response) {
        notification.log("Erreur : " + response.text);
    });
}]);

myApp.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('fr', {
      'BACK': 'Retour',
      'DELETE': 'Supprimer',
      'CREATE': 'Ajouter',
      'EDIT': 'Modifier',
      'EXPORT': 'Exporter',
      'ADD_FILTER': 'Filtrer',
      'SEE_RELATED': 'Voir les {{ entityName }} liés',
      'LIST': 'Liste',
      'SHOW': 'Détails',
      'SAVE': 'Enregistrer',
      'N_SELECTED': '{{ length }} sélectionnés',
      'ARE_YOU_SURE': 'Cette modification est définitive. Confirmez-vous ?',
      'YES': 'Oui',
      'NO': 'Non',
      'FILTER_VALUES': 'Filtrer',
      'CLOSE': 'Fermer',
      'CLEAR': 'Vider',
      'CURRENT': 'Aujourd\'hui',
      'REMOVE': 'Retirer',
      'ADD_NEW': 'Ajouter un nouveau {{ name }}',
      'BROWSE': 'Parcourir',
      'N_COMPLETE': '{{ progress }}% terminé',
      'CREATE_NEW': 'Créer',
      'SUBMIT': 'Valider',
      'SAVE_CHANGES': 'Enregistrer',
      'BATCH_DELETE_SUCCESS': 'Suppression enregistrée',
      'DELETE_SUCCESS': 'Suppression enregistrée',
      'ERROR_MESSAGE': 'Erreur serveur (code: {{ status }})',
      'INVALID_FORM': 'Formulaire invalide',
      'CREATION_SUCCESS': 'Création enregistrée',
      'EDITION_SUCCESS': 'Modifications enregistrées',
      'ACTIONS': 'Actions',
      'PAGINATION': '<strong>{{ begin }}</strong> - <strong>{{ end }}</strong> sur <strong>{{ total }}</strong>',
      'NO_PAGINATION': 'Aucun résultat',
      'PREVIOUS': '« Précédent',
      'NEXT': 'Suivant »',
      'DETAIL': 'Détail',
      'STATE_CHANGE_ERROR': 'Erreur de routage: {{ message }}',
      'NOT_FOUND': 'Page non trouvée',
      'NOT_FOUND_DETAILS': 'La page demandée n\'existe pas. Revenez à la page précédente et essayez autre chose.',
    });
    $translateProvider.preferredLanguage('fr');
}]);

var typeList = [];
// declare a function to run when the module bootstraps (during the 'config' phase)
myApp.config(['NgAdminConfigurationProvider', '$urlRouterProvider', '$stateProvider', function (nga, $urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
                .state('main', {
                    url: '/',
                    redirectTo: '/dashboard',
                })
        //console.log("AppController ", appController);
        // create an admin application
        var admin = nga.application('Projet de Cloud')
                // .baseApiUrl('http://52.9.18.187:8080/api/');
                .baseApiUrl(baseApiUrl);
        admin.header(customHeaderTemplate);
        // add the user entity to the admin application


        /********************QUARTIERS*****************/
        var quartier = nga.entity('quartier');
        quartier.listView().fields([
            nga.field('nom').isDetailLink(true),
            nga.field('recalcitrant', 'boolean')
                    .choices([
                        {value: true, label: 'Oui'},
                        {value: false, label: 'Non'}
                    ]),
            nga.field('nbmaisons', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
                    .targetFields([// which comment fields to display in the datagrid / form
                        nga.field('nom').label('Type maison'),
                        nga.field('nb')
                    ]),
            nga.field('custom_action')
                    .label('play')
                    .template('<launch-quartier post="entry" operation="pause" ng-model="operation"></launch-quartier>')

        ])
                .actions(['create', '<generation-start mode="demarrer" ng-model="mode"></generation-start>'])
                .listActions(['edit'])
                .title('Liste des Quartiers')
                ;

        quartier.creationView().fields([
            nga.field('nom').validation({required: true}),
            nga.field('recalcitrant', 'boolean')
                    .choices([
                        {value: false, label: 'Non'},
                        {value: true, label: 'Oui'}
                    ])
                    .defaultValue(false),
            nga.field('nbmaisons', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
                    .targetFields([// which comment fields to display in the datagrid / form
                        nga.field('id', 'choice')
                                .choices(typeList)
                                .label('Type maison')
                                .validation({required: true}),
                        nga.field('nb', 'number')
                                .validation({required: true})
                    ])
                    .label('Maisons')
                    .validation({required: true})
        ])
                .title('Creation de quartier');

        quartier.editionView().fields([
            nga.field('nom'),
            nga.field('recalcitrant', 'boolean')
                    .choices([
                        {value: false, label: 'Non'},
                        {value: true, label: 'Oui'}
                    ]).defaultValue(false),
            nga.field('nbmaisons', 'embedded_list') // Define a 1-N relationship with the (embedded) comment entity
                    .targetFields([// which comment fields to display in the datagrid / form
                        nga.field('id', 'choice')
                                .choices(typeList)
                                .label('Type maison'),
                        nga.field('nb', 'number')
                    ])
                    .label('Maisons')
                    .validation({required: true}),
            nga.field('custom_action')
                    .label('play')
                    .template('<launch-quartier post="entry" operation="pause" ng-model="operation"></launch-quartier>')
        ]);




        /*******************TYPES**********************/
        var types = nga.entity('type').label('Type de maison');
        // set the fields of the user entity list view
        types.listView().fields([
            nga.field('nom').label('Type').isDetailLink(true),
            nga.field('consommations.journee.min').label('Jour Min').editable(true),
            nga.field('consommations.journee.max').label('Jour Max'),
            nga.field('consommations.soiree.min').label('Soir Min'),
            nga.field('consommations.soiree.max').label('Soir Max'),
            nga.field('consommations.nuit.min').label('Nuit Min'),
            nga.field('consommations.nuit.max').label('Nuit Max')

        ])
                .actions(['create'])
                .title('Liste des types de maison');

        types.creationView().fields([
            nga.field('nom', 'string'),
            nga.field('consommations.journee.min', 'number').label('Jour Min').defaultValue(0),
            nga.field('consommations.journee.max', 'number').label('Jour Max').defaultValue(100),
            nga.field('consommations.soiree.min', 'number').label('Soir Min').defaultValue(0),
            nga.field('consommations.soiree.max', 'number').label('Soir Max').defaultValue(100),
            nga.field('consommations.nuit.min', 'number').label('Nuit Min').defaultValue(0),
            nga.field('consommations.nuit.max', 'number').label('Nuit Max').defaultValue(100)
        ])
                .title('Créer un type de maison');

        /*types.showView().fields([
         nga.field('id'),
         nga.field('nom', 'string'),
         nga.field('consommations.journee.min', 'number').label('Jour Min').editable('true'),
         nga.field('consommations.journee.max', 'number').label('Jour Max'),
         nga.field('consommations.soiree.min', 'number').label('Soir Min'),
         nga.field('consommations.soiree.max', 'number').label('Soir Max'),
         nga.field('consommations.nuit.min', 'number').label('Nuit Min'),
         nga.field('consommations.nuit.max', 'number').label('Nuit Max')
         
         ]).actions(['edit']);*/

        types.deletionView()
                .title('Supprimer le type de maison');

        types.editionView().fields([
            nga.field('nom', 'string'),
            nga.field('consommations.journee.min', 'number').label('Jour Min'),
            nga.field('consommations.journee.max', 'number').label('Jour Max'),
            nga.field('consommations.soiree.min', 'number').label('Soir Min'),
            nga.field('consommations.soiree.max', 'number').label('Soir Max'),
            nga.field('consommations.nuit.min', 'number').label('Nuit Min'),
            nga.field('consommations.nuit.max', 'number').label('Nuit Max')
        ])
                .title('Modifier le type de maison');


        /******************CONFIGURATION*********************/
        var config = nga.entity('config').label('Configuration');

        config.listView().fields([
            nga.field('frequence', 'number').label('Fréquence de génération').isDetailLink(true),
            nga.field('acceleration', 'number').label('Accélération du temps').isDetailLink(true)
            //nga.field('serveurs-kafka').isDetailLink(true),
            //nga.field('sujet-kafka').isDetailLink(true)
        ])
                .title('Configuration de la Simulation')
                .actions([])
                .listActions(['edit']);

        config.showView().fields([
            nga.field('frequence', 'number').label('Fréquence de génération'),
            nga.field('acceleration', 'number').label('Accélération du temps')
            //nga.field('serveurs-kafka').editable(false),
            //nga.field('sujet-kafka').editable(false)
        ])
                .title('Configuration de la Simulation')
                .url('config/1');

        config.editionView().fields([
            nga.field('frequence', 'number').label('Fréquence de génération *')
                .template('<ma-field field="::field" value="entry.values[field.name()]" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field><div class="col-sm-offset-2 text-warning" style="margin-top: -20px; margin-bottom: 60px;"><span class="col-sm-12">Les données seront générées chaque * secondes</span></div>', true),
            nga.field('acceleration', 'number').label('Accélération du temps **')
                .template('<ma-field field="::field" value="entry.values[field.name()]" entry="entry" entity="::entity" form="formController.form" datastore="::formController.dataStore"></ma-field><div class="col-sm-offset-2 text-warning" style="margin-top: -20px; margin-bottom: 60px;"><span class="col-sm-12">Le temps s\'écoulera ** fois plus vite que dans la vie réelle</span></div>', true)
            //nga.field('serveurs-kafka').editable(false),
            //nga.field('sujet-kafka').editable(false)
        ])
                .title('Configuration de la Simulation')
                .url('config/1')
                .actions(['back']);


        admin.addEntity(types);
        admin.addEntity(quartier);
        admin.addEntity(config);

        nga.configure(admin);
    }]);

myApp.controller('testController', ['$scope', 'stateParams', 'notification', '$http', function testController($stateParams, notification, $http) {
            
        this.postId = $stateParams.id;
        // notification is the service used to display notifications on the top of the screen
        this.notification = notification;

        testController.inject = ['$stateParams', 'notification'];
        testController.prototype.sendEmail = function () {
            this.notification.log('Email successfully sent to ' + this.email);
        }
    }]);

myApp.config(['RestangularProvider', '$stateProvider', function (RestangularProvider, $stateProvider) {
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData;
            extractedData = data.obj;
            // .. to look for getList operations
            if (operation === "getList") {
                //On récupère le cors de la réponse, qui se trouve dans data.obj

                console.log("what =", what, "url = ", url, "deferred = ", deferred, "extractedData = ", extractedData);

                //Si la requete faite est sur  "/type", on modifie l'attribut nbmaisons qui est un objet en un array d'objet
                //	nbmaisons : {									nbmaisons : [
                //		"1" : 20,				====>>					{id : 1, nb: 20},
                //		"2" : 15										{id : 2, nb : 15}
                //	}												]

                if (what === "quartier") {
                    for (k = 0; k < extractedData.length; k++) {
                        eDKNbmaisons = extractedData[k].nbmaisons;

                        for (l = 0; l < eDKNbmaisons.length; l++) {
                            //typeList.push({value : eDKNbmaisons[l].idtype, label : eDKNbmaisons[l].nomtype}); 
                        }
                    }

                    //console.log("quartier typeList = ", typeList);
                }


                if (what === "type") {
                    var nouvelId, nouveauLabel, existe;
                    for (k = 0; k < extractedData.length; k++) {
                        nouvelId = extractedData[k].id;
                        nouveauLabel = extractedData[k].nom;
                        existe = false;
                        for (l = 0; l < typeList.length; l++) {
                            if (typeList[l].value == nouvelId) {
                                existe = true;
                                break;
                            }
                        }
                        if (!existe) {
                            typeList.push({value: nouvelId, label: nouveauLabel});
                        }
                    }

                    console.log("quartier typeList = ", typeList);
                }

                /*if(what === "config"){
                 extractedData[0]['id'] = 1;
                 }*/

            }
            return extractedData;
        });

        RestangularProvider.addRequestInterceptor(
                function (element, operation, what, url) {

                    console.log("before sending the request element = ", element, " operation = ", operation, "what ", what, "url ", url);
                    url += "/creer";
                    return element;
                });

        $stateProvider.state('test', {
            parent: 'ng-admin',
            url: '/test/:id',
            params: {id: null},
            controller: 'testController',
            controllerAs: 'controller',
            template: testControllerTemplate
        });
    }]);

myApp.directive('launchQuartier', ['notification', '$http', '$rootScope', function (notification, $http, $rootScope) {
        return {
            restrict: 'E',
            scope: {post: '&'},
            link: function (scope, element, attr) {
                if($rootScope.simulationEnCours){
                    scope.operation = "pause";
                    attr.operation = "pause";
                    scope.op = 'pause';
                    scope.disabled = "";
                } else {
                    scope.operation = "relancer";
                    attr.operation = "relancer";
                    scope.op = 'play';
                    scope.disabled = "disabled";
                }
                scope.launchQuat = function () {
                    if (attr.operation === "pause") {
                        $http({
                            method: "POST",
                            url: baseApiUrl + "quartier/" + scope.post().values.id + "/stopper"
                        }).then(function succes(response) {
                            scope.operation = "relancer";
                            attr.operation = "relancer";
                            scope.op = 'play';
                            notification.log("Quartier " + scope.post().values.nom + " mis en pause avec succès", {addnCls: 'humane-flatty-success'});
                        }, function error(response) {
                            notification.log("Erreur : " + response.text);
                        });
                    } else if (attr.operation === "relancer") {
                        $http({
                            method: "POST",
                            url: baseApiUrl + "quartier/" + scope.post().values.id + "/relancer"
                        }).then(function succes(response) {
                            scope.operation = "pause";
                            attr.operation = "pause";
                            scope.op = 'pause';
                            notification.log("Consomation du Quartier " + scope.post().values.nom + " relancée avec succès", {addnCls: 'humane-flatty-info'});
                        }, function error(response) {
                            notification.log("Erreur : " + response.text);
                        });
                    }
                };
                scope.$on('quartierLaunched', function () {
                    attr.operation = "pause";
                    scope.operation = "pause";
                    scope.op = 'pause';
                    //scope.launchQuat();
                    scope.disabled = "";
                });
                scope.$on('quartierStoped', function () {
                    attr.operation = "relancer";
                    scope.operation = "relancer";
                    scope.op = 'play';
                    //scope.launchQuat();
                    scope.disabled = "disabled";
                });
            },
            template: '<a class="btn btn-default {{disabled}}" ng-click="launchQuat()"><span style="font-size:x-large;" class="glyphicon glyphicon-{{op}} ng-scope"></span></a>'
        };
    }]);

myApp.directive('generationStart', ['notification', '$http', '$rootScope', function (notification, $http, $rootScope) {
        return {
            restrict: 'AE',
            scope: {post: '&'},
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                // console.log("post ", scope, "attr ", attr);
                if(!$rootScope.simulationEnCours){
                    scope.mode = "Demarrer";
                    attr.mode = "Demarrer";
                } else {
                    scope.mode = "Arreter";
                    attr.mode = "Arreter";
                }
                scope.launch = function () {
                    if (attr.mode === "Demarrer") {
                        $http({
                            method: "POST",
                            url: baseApiUrl + "globale/generation/demarrer"
                        }).then(function succes(response) {
                            $rootScope.$broadcast('quartierLaunched');
                            scope.mode = "Arreter";
                            attr.mode = "Arreter";
                            notification.log("Simulation démarrée avec succès", {addnCls: 'humane-flatty-success'});
                        }, function error(response) {
                            notification.log("Erreur : " + response.text);
                        });
                    } else if (attr.mode === "Arreter") {
                        $http({
                            method: "POST",
                            url: baseApiUrl + "globale/generation/arreter"
                        }).then(function succes(response) {
                            $rootScope.$broadcast('quartierStoped');
                            scope.mode = "Demarrer";
                            attr.mode = "Demarrer";
                            notification.log("Simulation arretée avec succès");
                        }, function error(response) {
                            notification.log("Erreur : " + response.text);
                        });
                    } else {
                        notification.log("L'attribut mode spécifiée est incorrect", {addnCls: 'humane-flatty-error'});
                    }
                }
            },
            template: function (elem, attr) {
                return '<a class="btn btn-default" ng-click="launch()" > {{mode}} la  simulation</a>'
            }
        };
    }]);