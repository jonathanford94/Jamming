let accessToken;
const clientId = ''; //clientId from spotify account
const redirectUri = "http://localhost:3000/";

const Spotify = {
    
    // Gets access token from Spotify
    getAccessToken() {
        if (accessToken){
            return accessToken;
        }

        // check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        
        if(accessTokenMatch && expiresInMatch){
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // this clears the access parameters allowing us to grab a new access token when it expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessURL = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessURL;
        }
    },

    // Uses access token to return a response from the Spotify API using user search term from the SearchBar
    search(term) {
        const accessToken = Spotify.getAccessToken();

        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri,   
            }));
        });
    },

    // Gets a user's ID from Spotify, creates a new playlist on the user's account and then adds tracks to that playlist
    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length){
            return;
        }
        const accessToken = Spotify.getAccessToken();
        const headers = { 
            Authorization: `Bearer ${accessToken}`
        };
        let userId;

        // Return user's ID from Spotify API
        return fetch('https://api.spotify.com/v1/me', { 
            headers: headers 
        }).then(
            response => {
              if(response.ok) {
                return response.json();
              }  
            } 
        ).then(
            jsonResponse => {
            userId = jsonResponse.id;

            //Adds playlist to user's account
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(
                response => {
                if(response.ok) {
                    return response.json();
                } else {
                    console.log('API request failed');
                }
            }).then(
                jsonResponse => {
                    const playlistId = jsonResponse.id;

                    // Adds tracks to new playlist
                    return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris }),
                });
            });
        });
    }
};

export default Spotify;