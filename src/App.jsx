import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NGram from './pages/NGram';
import Word2Vec from './pages/Word2Vec';
import RNN from './pages/RNN';
import TransformerCh1 from './pages/TransformerCh1';
import TransformerCh2 from './pages/TransformerCh2';
import TransformerCh3 from './pages/TransformerCh3';
import RL from './pages/RL';
import TransformerV2 from './pages/TransformerV2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ngram" element={<NGram />} />
        <Route path="/word2vec" element={<Word2Vec />} />
        <Route path="/rnn" element={<RNN />} />
        <Route path="/transformer" element={<TransformerCh1 />} />
        <Route path="/transformer/layers" element={<TransformerCh2 />} />
        <Route path="/transformer/prediction" element={<TransformerCh3 />} />
        <Route path="/transformer-v2" element={<TransformerV2 />} />
        <Route path="/rl" element={<RL />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
