"use strict";

exports.__esModule = true;
exports.lastSelectionSent = exports.fsiOutputPID = exports.fsiOutput = undefined;
exports.isPowershell = isPowershell;
exports.sendCd = sendCd;
exports.activate = activate;


var _Utils = require("./../Core/Utils");

var _vscode = require("vscode");

var _path = require("path");

var path_1 = _interopRequireWildcard(_path);

var _fableCore = require("fable-core");

var _Helpers = require("./../fable_external/Helpers-1977695102");

var _Environment = require("./Environment");

var _Project = require("./../Core/Project");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var fsiOutput = exports.fsiOutput = null;
var fsiOutputPID = exports.fsiOutputPID = null;
var lastSelectionSent = exports.lastSelectionSent = null;

function isPowershell() {
    var t = _Utils.Configuration.get("", "terminal.integrated.shell.windows");

    return t.toLocaleLowerCase().indexOf("powershell") >= 0;
}

function sendCd() {
    var editor = _vscode.window.activeTextEditor;
    var patternInput = editor != undefined ? function () {
        var file = editor.document.fileName;
        var dir = path_1.dirname(file);
        return [file, dir];
    }() : function () {
        var dir = _vscode.workspace.rootPath;
        return [path_1.join(dir, "tmp.fsx"), dir];
    }();

    var msg1 = _fableCore.String.fsFormat("# silentCd @\"%s\";;\n")(function (x) {
        return x;
    })(patternInput[1]);

    var msg2 = _fableCore.String.fsFormat("fsi %d %s\n")(function (x) {
        return x;
    })(1)(patternInput[0]);

    _fableCore.Seq.iterate(function (n) {
        n.sendText("fsi " + editor.document.fileName + " # https://github.com/nicholaspaun/vsc-sharpener")
	n.sendText(";;") 
        //n.sendText(msg1, false);
        //n.sendText(msg2, false);
        //n.sendText(";;\n", false);
    }, function () {
        var $var16 = fsiOutput;

        if ($var16 != null) {
            return [$var16];
        } else {
            return [];
        }
    }());
}

function start() {
    return _Helpers.Promise.onFail(function (_arg1) {
        _vscode.window.showErrorMessage("Failed to spawn FSI, please ensure it's in PATH");
    }, function (builder_) {
        _fableCore.Seq.iterate(function (n) {
            n.dispose();
        }, function () {
            var $var17 = fsiOutput;

            if ($var17 != null) {
                return [$var17];
            } else {
                return [];
            }
        }());

        var parms = function () {
            var fsiParams = _fableCore.List.ofArray(_Utils.Configuration.get(new Array(0), "FSharp.fsiExtraParameters"));

            return Array.from(_Environment.isWin ? _fableCore.List.append(_fableCore.List.ofArray(["--fsi-server-input-codepage:65001"]), fsiParams) : fsiParams);
        }();

        var terminal = _vscode.window.createTerminal("F# Interactive", "/bin/bash");

        _Helpers.Promise.onSuccess(function (pId) {
            exports.fsiOutputPID = fsiOutputPID = pId;
        }, terminal.processId);

        exports.fsiOutput = fsiOutput = terminal;
        sendCd();
        terminal.show(true);
        return _Helpers.Promise.lift(terminal);
    }(_Helpers.PromiseBuilderImp.promise));
}

function send(msg) {
    var msgWithNewline = msg + "\n;;\n";
    return _Helpers.Promise.onFail(function (error) {
        _vscode.window.showErrorMessage("Failed to send text to FSI");
    }, _Helpers.Promise.onSuccess(function (fp) {
        fp.show(true);
        fp.sendText(msgWithNewline, false);
        exports.lastSelectionSent = lastSelectionSent = msg;
    }, fsiOutput != null ? function () {
        var fo = fsiOutput;
        return _Helpers.Promise.lift(fo);
    }() : start()));
}

function sendLine() {
    var editor = _vscode.window.activeTextEditor;
    var file = editor.document.fileName;
    var pos = editor.selection.start;
    var line = editor.document.lineAt(pos);

    _Utils.Promise.suppress(_Helpers.Promise.onSuccess(function (_arg1) {
        _vscode.commands.executeCommand("cursorDown");
    }, send(line.text)));
}

function sendSelection() {
    var editor = _vscode.window.activeTextEditor;
    var file = editor.document.fileName;

    if (editor.selection.isEmpty) {
        sendLine();
    } else {
        var range = new _vscode.Range(editor.selection.anchor.line, editor.selection.anchor.character, editor.selection.active.line, editor.selection.active.character);
        var text = editor.document.getText(range);

        _Utils.Promise.suppress(send(text));
    }
}

function sendLastSelection() {
    if (lastSelectionSent == null) {} else {
        (function () {
            var x = lastSelectionSent;

            _Utils.Promise.suppress(_Helpers.Promise.bind(function (_arg1) {
                return send(x);
            }, _Utils.Configuration.get(false, "FSharp.saveOnSendLastSelection") ? _vscode.window.activeTextEditor.document.save() : _Helpers.Promise.lift(true)));
        })();
    }
}

function sendFile() {
    var editor = _vscode.window.activeTextEditor;
    var text = editor.document.getText();

    _Utils.Promise.suppress(send(text));
}

function referenceAssembly(path) {
    return send(_fableCore.String.fsFormat("#r @\"%s\"")(function (x) {
        return x;
    })(path));
}

var referenceAssemblies = function referenceAssemblies(items) {
    return _Utils.Promise.executeForAll(function (path) {
        return referenceAssembly(path);
    }, items);
};

function sendReferences() {
    _fableCore.Seq.iterate(function (p) {
        _Utils.Promise.suppress(referenceAssemblies(_fableCore.List.filter(function (n) {
            return !_fableCore.String.endsWith(n, "FSharp.Core.dll") ? !_fableCore.String.endsWith(n, "mscorlib.dll") : false;
        }, p.References)));
    }, function () {
        var $var18 = (0, _Project.tryFindLoadedProjectByFile)(_vscode.window.activeTextEditor.document.fileName);

        if ($var18 != null) {
            return [$var18];
        } else {
            return [];
        }
    }());
}

function handleCloseTerminal(terminal) {
    _fableCore.Seq.iterate(function (currentTerminalPID) {
        _Utils.Promise.suppress(_Helpers.Promise.onSuccess(function (closedTerminalPID) {
            if (closedTerminalPID === currentTerminalPID) {
                exports.fsiOutput = fsiOutput = null;
                exports.fsiOutputPID = fsiOutputPID = null;
            }
        }, terminal.processId));
    }, function () {
        var $var19 = fsiOutputPID;

        if ($var19 != null) {
            return [$var19];
        } else {
            return [];
        }
    }());
}

function generateProjectReferences() {
    var ctn = function () {
        var $var20 = (0, _Project.tryFindLoadedProjectByFile)(_vscode.window.activeTextEditor.document.fileName);

        if ($var20 != null) {
            return function (p) {
                return Array.from(_fableCore.Seq.delay(function () {
                    return _fableCore.Seq.append(_fableCore.List.map(_fableCore.String.fsFormat("#r @\"%s\"")(function (x) {
                        return x;
                    }), _fableCore.List.filter(function (n) {
                        return !_fableCore.String.endsWith(n, "FSharp.Core.dll") ? !_fableCore.String.endsWith(n, "mscorlib.dll") : false;
                    }, p.References)), _fableCore.Seq.delay(function () {
                        return _fableCore.List.map(_fableCore.String.fsFormat("#load @\"%s\"")(function (x) {
                            return x;
                        }), p.Files);
                    }));
                }));
            }($var20);
        } else {
            return $var20;
        }
    }();

    return function (builder_) {
        return ctn == null ? _Helpers.Promise.lift() : function () {
            var path = path_1.join(_vscode.workspace.rootPath, "references.fsx");
            return _Helpers.Promise.bind(function (_arg1) {
                return _Helpers.Promise.bind(function (_arg2) {
                    return _Helpers.Promise.bind(function (_arg3) {
                        return _Helpers.Promise.lift();
                    }, _arg2.edit(function (e) {
                        var p = new _vscode.Position(0, 0);

                        var ctn_1 = _fableCore.String.join("\n", ctn);

                        e.insert(p, ctn_1);
                    }));
                }, _vscode.window.showTextDocument(_arg1, 3));
            }, _vscode.workspace.openTextDocument(_vscode.Uri.parse("untitled:" + path)));
        }();
    }(_Helpers.PromiseBuilderImp.promise);
}

function activate(disposables) {
    _vscode.window.onDidChangeActiveTextEditor(function (n) {
        if (n != undefined) {
            sendCd();
        }
    }, null, disposables);

    _vscode.window.onDidCloseTerminal(function (terminal) {
        handleCloseTerminal(terminal);
    }, null, disposables);

    _vscode.commands.registerCommand("fsi.Start", function () {
        return start();
    });

    _vscode.commands.registerCommand("fsi.SendLine", function () {
        sendLine();
    });

    _vscode.commands.registerCommand("fsi.SendSelection", function () {
        sendSelection();
    });

    _vscode.commands.registerCommand("fsi.SendLastSelection", function () {
        sendLastSelection();
    });

    _vscode.commands.registerCommand("fsi.SendFile", function () {
        sendFile();
    });

    _vscode.commands.registerCommand("fsi.SendProjectReferences", function () {
        sendReferences();
    });

    _vscode.commands.registerCommand("fsi.GenerateProjectReferences", function () {
        return generateProjectReferences();
    });
}
//# sourceMappingURL=Fsi.js.map
