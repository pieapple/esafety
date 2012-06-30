/*
 *
 * Python bindings for the ekho speech synthesizer
 *
 * Copyright © 2012 Zhihong Liu <pieapple03@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#include <Python.h>
#include "ekho.h"

using namespace ekho;

Ekho* wong;

static bool
pyekho_initialize() {
    wong = new Ekho("Mandarin");

    return (wong!=NULL);
}

static void
pyekho_finalize() {
    if(wong != NULL)
        delete wong;
}

static PyObject *
pyespeak_synth(PyObject *self, PyObject *args) {
    const char *text;

    if (!PyArg_ParseTuple(args, "s", &text))
        return NULL;

    size_t len = strlen(text) + 1;

    if (len > 0)
    {
        wong->blockSpeak(text);
        Py_INCREF(Py_True);
        return Py_True;
    }
    else
    {
        Py_INCREF(Py_False);
        return Py_False;
    }
}

static PyObject *
pyespeak_saveWav(PyObject *self, PyObject *args) {
    const char *text;
    const char *filename;

    if (!PyArg_ParseTuple(args, "ss", &text, &filename))
        return NULL;

    size_t len = strlen(text) + 1;
    size_t flen = strlen(filename) + 1;

    if (len > 0 && flen > 0)
    {
        wong->saveWav(text, filename);
        Py_INCREF(Py_True);
        return Py_True;
    }
    else
    {
        Py_INCREF(Py_False);
        return Py_False;
    }
}

static PyObject *
pyespeak_saveOgg(PyObject *self, PyObject *args) {
    const char *text;
    const char *filename;

    if (!PyArg_ParseTuple(args, "ss", &text, &filename))
        return NULL;

    size_t len = strlen(text) + 1;
    size_t flen = strlen(filename) + 1;

    if (len > 0 && flen > 0)
    {
        wong->saveOgg(text, filename);
        Py_INCREF(Py_True);
        return Py_True;
    }
    else
    {
        Py_INCREF(Py_False);
        return Py_False;
    }
}

/* Module Methods Table */
static PyMethodDef EkhoMethods[] = {
    {"synth", (PyCFunction)pyespeak_synth, METH_VARARGS,
        "Synthesizes the given text."},
    {"saveWav", (PyCFunction)pyespeak_saveWav, METH_VARARGS,
        "Save sound of the given text as wav."},
    {"saveOgg", (PyCFunction)pyespeak_saveOgg, METH_VARARGS,
        "Save sound of the given text as Ogg."},
    {NULL, NULL, 0, NULL}
};

PyMODINIT_FUNC
initpyekho(void) {
    // Initialize the Python module
    PyObject *module;

    module = Py_InitModule("pyekho", EkhoMethods);

    if(module == NULL)
        return;

    // Initialize ekho
    if(pyekho_initialize() == -1) {
        PyErr_SetString(PyExc_SystemError, "could not initialize ekho");
        return;
    }

    atexit(pyekho_finalize);
}
