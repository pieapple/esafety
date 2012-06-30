#! /usr/bin/env python
# coding: utf-8

from distutils.core import setup, Extension

module = Extension('pyekho',
	sources = ['pyekho.cpp'], 
    define_macros = [('_REENTRANT', None)],
    extra_compile_args = ['-pthread'],
    extra_objects = ["lib/libekho.a"],
    include_dirs = ['include'],
    library_dirs = ['/usr/local/lib'],
	libraries = ['esd', 'vorbisenc', 'vorbis', 'm', 'ogg', 'mp3lame', 'sndfile', 'ncurses', 'pulse', 'pulse-simple', 'Festival', 'estools', 'eststring', 'estbase'])

setup(
    name = 'pyekho',
    version = '0.1',
    description = 'Python bindings for the ekho speech synthesizer',
    author = 'Zhihong Liu',
    author_email = 'pieapple03@gmail.com',
    license = 'GPL',
    platforms = 'posix',
    ext_modules = [module],
    )
