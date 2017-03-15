import $ from 'jquery';

/* eslint-disable */

class Dropzone {
    static pluginName = 'Dropzone'
    _entered = 0
    _init () {
        this.editor = this._module;
        if (this.editor.uploader == null) {
            throw new Error("Can't work without 'simple-uploader' module");
            return;
        }
        $(document.body).on('dragover', function (e) {
            e.originalEvent.dataTransfer.dropEffect = 'none';
            return e.preventDefault();
        });
        $(document.body).on('drop', function (e) {
            return e.preventDefault();
        });
        this.imageBtn = this.editor.toolbar.findButton('image');
        return this.editor.body.on('dragover', function (e) {
            e.originalEvent.dataTransfer.dropEffect = 'copy';
            e.stopPropagation();
            return e.preventDefault();
        }).on('dragenter', (function (_this) {
            return function (e) {
                if ((_this._entered += 1) === 1) {
                    _this.show();
                }
                e.preventDefault();
                return e.stopPropagation();
            };
        })(this)).on('dragleave', (function (_this) {
            return function (e) {
                if ((_this._entered -= 1) <= 0) {
                    _this.hide();
                }
                e.preventDefault();
                return e.stopPropagation();
            };
        })(this)).on('drop', (function (_this) {
            return function (e) {
                var file, imageFiles, _i, _j, _len, _len1, _ref;
                imageFiles = [];
                _ref = e.originalEvent.dataTransfer.files;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    file = _ref[_i];
                    if (!_this.validFile(file)) {
                        alert('「' + file.name + ']」文件不是图片。');
                        _this.hide();
                        return false;
                    }
                    imageFiles.push(file);
                }
                for (_j = 0, _len1 = imageFiles.length; _j < _len1; _j++) {
                    file = imageFiles[_j];
                    _this.editor.uploader.upload(file, {
                        inline: true
                    });
                }
                _this.hide();
                e.stopPropagation();
                return e.preventDefault();
            };
        })(this));
    }
    show () {
        return this.imageBtn.setActive(true);
    }

    hide () {
        this.imageBtn.setActive(false);
        return this._entered = 0;
    }

    validFile (file) {
        return file.type.indexOf('image/') > -1;
    }

}

export default Dropzone;
