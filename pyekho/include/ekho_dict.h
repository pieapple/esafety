/***************************************************************************
 * Copyright (C) 2008-2010 by Cameron Wong                                 *
 * name in passport: HUANG GUANNENG                                        *
 * email: hgneng at yahoo.com.cn                                           *
 * website: http://www.eguidedog.net                                       *
 *                                                                         *
 * This program is free software; you can redistribute it and/or modify    *
 * it under the terms of the Creative Commons GNU GPL.                     *
 *                                                                         *
 * To get a Human-Readable description of this license,                    *
 * please refer to http://creativecommons.org/licenses/GPL/2.0/            *
 *                                                                         *
 * To get Commons Deed Lawyer-Readable description of this license,        *
 * please refer to http://www.gnu.org/licenses/old-licenses/gpl-2.0.html   *
 *                                                                         *
 **************************************************************************/
#ifndef EKHO_DICT
#define EKHO_DICT

//#define DEBUG_ANDROID

#include "character.h"
#include "zhy_symbol_map.h"
#include "zh_symbol_map.h"
#include <map>
#include <list>
#include <sndfile.h>
using namespace std;

namespace ekho {
typedef enum {
  CANTONESE = 1,
  MANDARIN = 2,
  ENGLISH = 3,
  KOREAN = 4,
  HAKKA = 5,
} Language;

struct DictItem {
	DictItem() {
		wordList = 0;
	}
  ~DictItem() {
    if (wordList) {
      delete wordList;
      wordList = 0;
    }
  }
  Character character;
  list< list<Character> > *wordList;
};

class SymbolLetter {
  public:
    unsigned short index;
    SymbolLetter *next;
    static const int SIZE = 36;
};

class Dict {
  public:
    Dict(void);
    Dict(Language lang);
    ~Dict(void);

    static bool mDebug;
    string mDataPath;
    string mVoiceFileType; // "wav" or "gsm"
    SF_INFO mSfinfo;
    const static int SYMBOL_ARRAY_SIZE = 8000;

    /**
     * Map code to PhoneticSymbol
     */
    // for Mandarin and Cantonese
    static PhoneticSymbol mSymbolArray[SYMBOL_ARRAY_SIZE];

    // for Hakka
    PhoneticSymbol* mKaSymbolArray[SYMBOL_ARRAY_SIZE];
    int mKaSymbolIndex; // for aditional dictionary

    SymbolLetter mKaSymbolLetter[SymbolLetter::SIZE];
    int getSymbolCode(SymbolLetter *root, const char *symbol);

    int setLanguage(Language lang);
    inline Language getLanguage(void) { return mLanguage; };
    int setVoice(string voice);
    inline string getVoice(void) { return mVoice; };
    PhoneticSymbol* lookup(Character &c);
    inline PhoneticSymbol* lookup(unsigned int code) {
      Character c(code);
      return lookup(c);
    };
    inline list<PhoneticSymbol*> lookup(string &text) {
      list<Character> charList = Character::split(text);
      return lookup(charList);
    }
    list<PhoneticSymbol*> lookup(list<Character> &charList);
    inline list<PhoneticSymbol*> lookup(const char *text) {
      string str(text);
      return lookup(str);
    };
    int loadEspeakDict(const char *path);
    inline int loadEspeakDict(const string &path) {
      return loadEspeakDict(path.c_str());
    };
    int saveEkhoDict(const char *path);
    inline int saveEkhoDict(const string &path) {
      return saveEkhoDict(path.c_str());
    };
    int loadEkhoDict(const char *path);
    inline int loadEkhoDict(const string &path) {
      return loadEkhoDict(path.c_str());
    };
    inline PhoneticSymbol* getFullPause(void) { return mFullPause; };
    inline PhoneticSymbol* getHalfPause(void) { return mHalfPause; };
    inline PhoneticSymbol* getQuaterPause(void) { return mQuaterPause; };

  private:
    /**
     * Map character code to DictItem
     */
    DictItem mDictItemArray[65536];
    map<int,DictItem> mExtraDictItemMap;

    string mVoice;
    int mFullPausePcmSize;
    char *mFullPausePcm;
    char *mHalfPausePcm;
    char *mQuaterPausePcm;
    Language mLanguage;
    PhoneticSymbol *mFullPause;
    PhoneticSymbol *mHalfPause;
    PhoneticSymbol *mQuaterPause;

    void init(void);
    string getDefaultDataPath(void);
    void addSpecialSymbols(void);

    inline PhoneticSymbol* getZhyPhon(const char *sym) {
      return &mSymbolArray[ZHY_PHash::in_word_set(sym, strlen(sym))->code];
    }

    inline PhoneticSymbol* getZhPhon(const char *sym) {
      return &mSymbolArray[ZH_PHash::in_word_set(sym, strlen(sym))->code];
    }

    inline void addDictItem(unsigned short code, PhoneticSymbol* phonSymbol) {
      mDictItemArray[code].character.code = code;
      mDictItemArray[code].character.phonSymbol = phonSymbol;
    }
};

}

#endif
