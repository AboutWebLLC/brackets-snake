/*
 * Copyright (c) 2012 Jonathan Rowny. All rights reserved.
 * http://www.jonathanrowny.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub:true */
/*global define, brackets, $, window, CodeMirror, setTimeout */

define(function (require, exports, module) {
    'use strict';
    var Commands                = brackets.getModule("command/Commands"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        Menus                   = brackets.getModule("command/Menus");
    
    function _handleSnake() {
        var direction = "right",
            running = true,
            SPEED = 10,
            editor = EditorManager.getCurrentFullEditor(),
            pos = editor.getCursorPos(),
            target,
            snake = [pos],
            startValue = editor._codeMirror.getValue();
        
        if (CodeMirror.keyMap && CodeMirror.keyMap['default']) {
            target = CodeMirror.keyMap['default'];
        } else {
            if (!CodeMirror.defaults.extraKeys) {
                CodeMirror.defaults.extraKeys = {};
            }
            target = CodeMirror.defaults.extraKeys;
        }
        
        var quit = function () {
            running = false;
            delete target['W'];
            delete target['A'];
            delete target['D'];
            delete target['S'];
            delete target['Q'];
            target.nofallthrough = false;
            editor._codeMirror.setOption("readOnly", false);
            editor._codeMirror.setValue(startValue);
        };
        
        target.nofallthrough = true;
        editor._codeMirror.setOption("readOnly", true);
        target['W'] = function (cm) {
            direction = "up";
        };
        target['A'] = function (cm) {
            direction = "left";
        };
        target['D'] = function (cm) {
            direction = "right";
        };
        target['S'] = function (cm) {
            direction = "down";
        };
        target['Q'] = function (cm) {
            quit();
        };
        var getNextPosition = function (old) {
            if (direction === "right") {
                old.ch++;
            }
            if (direction === "left") {
                old.ch--;
            }
            
            if (direction === "up") {
                old.line--;
            }
            
            if (direction === "down") {
                old.line++;
            }
            return old;
        };
        
        //main snake loop
        function loop() {
            var oldpos = {ch: pos.ch, line: pos.line},
                bodyShape = "▓";
            pos = getNextPosition(oldpos);
            snake.push(pos);
            editor._codeMirror.setCursor(pos);
        
            //might need to use padding
            var newUpPos = editor.getCursorPos(), padding = "", j, lenUp = pos.ch - newUpPos.ch;
            for (j = 1; j < lenUp; j++) {
                padding += " ";
            }
            //find the next character we're going to hit
            var nextChar = editor._codeMirror.getRange({ch: pos.ch - 1, line: pos.line}, pos);
            //if the next character is blank, then chop off the back of the snake
            if (nextChar === " " || nextChar === "") {
                var toDelete = snake.shift();
                editor._codeMirror.replaceRange(" ", {ch: toDelete.ch - 1, line: toDelete.line}, toDelete);
            } else if (nextChar === "▓") {
                //if we hit a part of the snake, we lost.
                quit();
                alert("gameover, your score is " + snake.length);
            }
            
            if (running) {
                editor._codeMirror.replaceRange(padding + bodyShape, {ch: pos.ch - 1, line: pos.line}, pos);
                setTimeout(loop, SPEED);
            }
        }
        loop();
    }
    
    
    //commands
    var PRODUCTIVITY_SNAKE = "productivity.snake";
    CommandManager.register("Snake", PRODUCTIVITY_SNAKE, _handleSnake);
    
    
    function init() {
        var c_menu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
        c_menu.addMenuItem(PRODUCTIVITY_SNAKE);
    }
    
    init();
    
});