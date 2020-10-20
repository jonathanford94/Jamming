import React from 'react';
import './App.css';
import { SearchResults } from '../SearchResults/SearchResults';
import { SearchBar } from '../SearchBar/SearchBar';
import { Playlist } from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';


class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      searchResults: [],
      playlistName: "New Playlist",
      playlistTracks: []
    };
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    let tracks = this.state.playlistTracks;

    if (tracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }

    tracks.push(track);
    this.setState({playlistTracks: tracks});
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    
    let newTracks = tracks.filter(savedTrack => {
      return savedTrack.id !== track.id; 
    }) 
    this.setState({playlistTracks: newTracks});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }

  savePlaylist() {
    const trackUris = this.state.playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
      this.setState({
        playlistName: 'New Playlist',
        playlistTracks: [],
      });
    });
  }

  search(term) {
    Spotify.search(term).then(searchResults => {
      this.setState({ searchResults: searchResults })
    });
  }

  render() {
    return(
      <div>
      <h1>PLY<span className="highlight">LST</span>R</h1>
      <div className="App">
        <p className="introduction">Welcome to PLYLSTR, a web app in which you can access your spotify account search for songs and build playlists which can then be saved to your account. To get started search for a song or artist below and you will be prompted to login to your account on Spotify's website, you will then be able to search for songs.</p>
        <SearchBar onSearch={this.search} />
        <div className="App-playlist">
          <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
          <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
        </div>
      </div>
    </div>
    )
  }
}

export default App;
