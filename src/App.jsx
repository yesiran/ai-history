import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NGram from './pages/NGram';
import Word2Vec from './pages/Word2Vec';
import RNN from './pages/RNN';
import Transformer from './pages/Transformer';
import RL from './pages/RL';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ngram" element={<NGram />} />
        <Route path="/word2vec" element={<Word2Vec />} />
        <Route path="/rnn" element={<RNN />} />
        <Route path="/transformer" element={<Transformer />} />
        <Route path="/rl" element={<RL />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;