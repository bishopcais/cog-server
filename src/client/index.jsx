import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import Container from './components/container';

Modal.setAppElement('#root');
Modal.defaultStyles.overlay.overflowY = 'auto';

ReactDOM.render(<Container />, document.getElementById('root'));
