/*! Rappid v2.1.0 - HTML5 Diagramming Framework - TRIAL VERSION

Copyright (c) 2015 client IO

 2017-04-24 


This Source Code Form is subject to the terms of the Rappid Trial License
, v. 2.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_v2.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


var App = App || {};
App.config = App.config || {};

(function() {

    'use strict';

    App.config.toolbar = {
        groups: {
            'undo': { index: 1 },
            'redo':{index:2},
            'clear': { index: 3},
            /* 'export': { index: 3 }, */
            'print': { index: 4 },
            'fullscreen': { index: 5 },
            'order': { index: 6 },
            'layout': { index: 7 },
            'zoom': { index: 8 },    
            'Reverse-Engineering': {index: 9},
        },
        tools: [
		/*	{
                type: 'button',
                name: 'Load',
                group: 'custom',
                attrs: {
                    button: {
                        'data-tooltip': 'Generate Scenarios',
                        'data-tooltip-position': 'top',
                        'class': 'btnGenerate scenario',
                        'id': 'btn-png-scenario1',
                        'data-tooltip-position-selector': '.toolbar-container'                        
                    }
                }
            },*/
         
           	{
                type: 'undo',
                name: 'undo',
                group: 'undo',

                attrs: {
                    button: {
                        'id': 'btn-undo',
                        'data-tooltip': 'Undo',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-undo'
                    }                 
                }
            },
            {
                type: 'redo',
                name: 'redo',
                group: 'redo',
                attrs: {
                    button: {
                        'id': 'btn-redo',
                        'data-tooltip': 'Redo',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-repeat'
                    }
                }
            },
            {
                type: 'button',
                name: 'clear',
                group: 'clear',
                attrs: {
                    button: {
                        id: 'btn-clear',
                        'data-tooltip': 'Clear Paper',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-trash-o'
                    }
                }
            },
           
            {
                type: 'button',
                name: 'print',
                group: 'print',
                attrs: {
                    button: {
                        id: 'btn-print',
                        'data-tooltip': 'Open a Print Dialog',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-print'
                    }
                }
            }, 			
            {
                type: 'button',
                group: 'layout',
                name: 'layout',
                attrs: {
                    button: {
                        id: 'btn-layout',
                        'data-tooltip': 'Auto-layout Graph',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-sitemap'
                    }
                }
            },
            {
                type: 'zoom-to-fit',
                name: 'zoom-to-fit',
                group: 'zoom',
                attrs: {
                    button: {
                        'id': 'btn-zoom-to-fit',
                        'class':'fa fa-search',
                        'data-tooltip': 'Zoom To Fit',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container'
                        
                    }
                }
            },
            {
                type: 'zoom-out',
                name: 'zoom-out',
                group: 'zoom',
                attrs: {
                    button: {
                        'id': 'btn-zoom-out',
                        'data-tooltip': 'Zoom Out',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-search-minus'
                    }
                }
            },
            {
                id: 'btn-zoom-slider-label',
                type: 'label',
                name: 'zoom-slider-label',
                group: 'zoom',
                text: 'Zoom:'
            },
            {
                id: 'btn-zoom-slider',
                type: 'zoom-slider',
                name: 'zoom-slider',
                group: 'zoom'
            },
            {
                type: 'zoom-in',
                name: 'zoom-in',
                group: 'zoom',
                attrs: {
                    button: {
                        'id': 'btn-zoom-in',
                        'data-tooltip': 'Zoom In',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-search-plus'
                    }
                }
            },

            {
                type: 'Button',
                name: 'Reverse Engineering',
                group: 'ReverseEngineering',
                attrs: {
                    button: {
                        'id': 'btn-rev-eng',
                        'data-tooltip': 'Reverse Engineering',
                        'data-tooltip-position': 'top',
                        'data-tooltip-position-selector': '.toolbar-container',
                        'class':'fa fa-cogs icon-btn-disable'
                    }
                }
            },
        ]
    };
    // The fullscreen feature is available only if the application is not displayed within an iframe.
    if (window.self === window.top) {
        App.config.toolbar.tools.push({
            type: 'button',
            name: 'fullscreen',
            group: 'fullscreen',
            attrs: {
                button: {
                    id: 'btn-fullscreen',
                    'data-tooltip': 'Toggle Fullscreen Mode',
                    'data-tooltip-position': 'top',
                    'data-tooltip-position-selector': '.toolbar-container',
                    'class':'fa fa-arrows-alt'
                }
            }
        });
    }
})();
