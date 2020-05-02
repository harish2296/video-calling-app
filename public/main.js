let Peer = require('simple-peer');
let socket = io();
const ourVideo = document.querySelector('video');
let clientVideo = {};


/**
 * get stream from client / other person
 */

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        socket.emit('new-client');
        console.log(stream);
        ourVideo.srcObject = stream;
        ourVideo.play();
        /**
         * initialize a peer
         * @param {} type 
         */
        function initPeer(type) {
            let peer = new Peer({ initiator: (type == "init") ? true : false, stream: stream, trickle: false });
            console.log(peer);
            /**
             * peer event, if stream create a new video
             */
            peer.on('stream', function (streamClient) {
                createVideo(streamClient);
            });

            /**
             * Peer event, on close hence closes video 
             */
            peer.on('close', function () {
                document.getElementById('peer-video').remove();
                peer.destroy();
            });

            return peer;
        }

        function createClient() {
            client.isNewClient = true;
            let peer = initPeer('init');
            peer.on('signal', (data) => {
                if (client.isNewClient) {
                    socket.emit('Request', data);
                }
            });

            client.peer = peer;
        }

        /** 
         * Client Responses to request it initated when ackowledgement came from server.
        */
        function clientResponse(data) {
            let peer = initPeer('not-init');
            peer.on('signal', (data) => {
                socket.emit('Response', data);
            });
            peer.signal(data);
            client.peer = peer;
        }

        /**
         * Client Answer's to ack as Response and in return streams it's data in socket channel.
         * @param {*} data 
         */
        function clientStream(data) {
            client.isNewClient = false;
            let peer = client.peer;
            peer.signal(data);
        }

        function createVideo(stream) {
            let video = document.createElement('video');
            video.id = 'peer-video';
            video.srcObject = stream;
            video.setAttribute('class', 'embed-responsive-item');
            document.querySelector('#peerElement').appendChild(video);
            video.play();
        }


        function sessionActive() {
            document.write('Session Active. Please come back later')
        }

        function removeVideo() {
            document.getElementById('peer-video').remove();
        }

        socket.on('CreateClient', createClient);
        socket.on('Acknowledgement', clientResponse);
        socket.on('StreamData', clientStream);
        socket.on('SessionActive', sessionActive);
        socket.on('Disconnect', removeVideo)
    })
    .catch(err => {
        document.write(err);
    })