'use strict';

/**
 * @ngdoc function
 * @name scrambleApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the scrambleApp
 */
angular.module('scrambleApp')
    .controller('MainCtrl', function ($scope, $uibModal, $timeout) {
        this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
        $(".input-space").focus(); //set user into here, negate need for mouse
        $scope.targetWord = ""
        $scope.limitVal = 0;
        $scope.inputText = "";
        $scope.jumbleWord = ""
        $scope.iterator = 0;
        $scope.difficulty = 0;

        //a function to get a new background color when the difficulty ups
        $scope.getColor = function () {
            var colorArray = ["#FFC700", "#FFAF00", "#FF8100", "#F46700", "#CC5C19", "#98391A", "#5F1915", "#2F090B"]
            return colorArray[$scope.difficulty];
        }

        //check if the difficulty needs to increase
        $scope.getDifficulty = function () {
                if ($scope.iterator % 3 === 0 && $scope.iterator <21) {
                    $scope.difficulty++;
                }
            }
            //change the background based on the diffculty
        $scope.checkNewBG = function () {
            $("body").animate({
                backgroundColor: $scope.getColor()
            }, 3000);
            $(".input-space").animate({
                backgroundColor: $scope.getColor()
            }, 3000);
            if ($scope.iterator >17){
                $(".input-space").css({"color": "#F3FFE2"})
                $(".jumble").css({"color": "#F3FFE2"})
            }
        }

        //validity check of answer
        $scope.checkValid = function () {
            //limit the value in case they keep typing
            if ($scope.inputText != undefined) {
                if ($scope.inputText.length > $scope.limitVal) {
                    $scope.inputText = $scope.inputText.split('').slice(0, $scope.limitVal).join('')
                }
            }
            //check if the answer is correct
            if ($scope.inputText === $scope.targetWord) {
                $scope.open();
            } else {
                //check if it's the right length/letters and has a dictionary def
                dictOk()
            }
        }
        var dictOk = function () {
                $scope.checkDict = false;
                if ($scope.inputText != undefined) {
                    //do they contain the same letters?
                    var iArr = $scope.inputText.split('').sort().join('')
                    var tArr = $scope.targetWord.split('').sort().join('')
                    if (iArr != tArr) {
                        $scope.checkDict = false;
                    } else {
                        var config = {
                            api_key: '2a11610285374407c80e69895ab03b2603be785ed962929f9',
                            limit: 10,
                            sourceDictionaries: 'ahd,wiktionary'
                        };

                        $.ajax({
                            type: 'GET',
                            url: '//api.wordnik.com/v4/word.json/' + $scope.inputText + '/definitions',
                            dataType: 'json',
                            data: config,
                            success: function (data) {
                                if (data.length > 0) {
                                    //is there a dict definition?
                                    $scope.open();
                                    $scope.checkDict = true;
                                } else {
                                    $scope.checkDict = false;
                                }
                            },
                            error: function (response) {
                                console.log(response);
                            }
                        });
                    }
                }

            }
            //jumble letters using Fisher Yates shuffle - taken from https://bost.ocks.org/mike/shuffle/
        $scope.jumble = function () {
            var jArr = $scope.targetWord.split('');
            var m = jArr.length,
                t, i;
            while (m) {
                i = Math.floor(Math.random() * m--);
                t = jArr[m];
                jArr[m] = jArr[i];
                jArr[i] = t;
            }

            return jArr.join("");
        }

        //get a new word using wordnik
        $scope.getNewWord = function () {
                var config = {
                    api_key: '2a11610285374407c80e69895ab03b2603be785ed962929f9',
                    minLength: ($scope.difficulty + 4),
                    maxLength: ($scope.difficulty + 6),
                    hasDictionaryDef: true,
                    minCorpusCount: 3000,
                    excludePartOfSpeech: 'proper-noun'
                };

                $.ajax({
                    type: 'GET',
                    url: '//api.wordnik.com/v4/words.json/randomWord?',
                    dataType: 'json',
                    data: config,
                    success: function (data) {
                        //checks if the word has a capital (proper noun doesn't seem to catch everything) or a hyphen or an apostrophe
                        if (/^[A-Z'-]/.test(data.word)) {
                            $scope.getNewWord();
                        } else {
                            $timeout(function () {
                                $scope.targetWord = data.word;
                                $scope.jumbleWord = $scope.jumble();
                                $(".jumble").animate({
                                    opacity: 1
                                }, 1500, function () {
                                    // Animation complete.
                                });
                                $scope.limitVal = $scope.targetWord.length;
                                console.log($scope.targetWord)
                            })
                        }


                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            }
            //get first new word
        $scope.getNewWord();
        //opens the modal that tells you you succeeded
        $scope.open = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'success.html',
                controller: 'ModalInstanceCtrl',
                size: "sm",
                resolve: {}
            });

            modalInstance.result.then(function () {
                //reset and get a new word
                $scope.inputText = "";
                $(".jumble").css({
                    "opacity": 0
                })
                $scope.iterator++;
                $scope.getDifficulty();
                $scope.checkNewBG();
                $scope.getNewWord();

            }, function () {});
        };

    })

.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $("body").keyup(function (event) {
        if (event.keyCode == 13) {
            $uibModalInstance.close("new");
        }
    });
    $scope.next = function () {
        $uibModalInstance.close("new");
    };

});