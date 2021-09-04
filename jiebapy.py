# coding:utf-8

import jieba, sys, json
#如果您的電腦同時要使用兩個版本的jieba，請自訂cache檔名，避免兩個cache互相蓋住對方
jieba.dt.cache_file = 'jieba.cache.cht'

jieba.load_userdict('mydict.txt')

with open('word', 'r', encoding='utf-8') as word:
    #  print(word)
    seglist = jieba.cut_for_search(word.read())

with open('count.json', 'r', encoding='utf-8') as count:
    hash = json.load(count)
    map = {}
    for item in seglist:
        map[item] = 1
        if item in hash:
            hash[item] += 1
        else:
            hash[item] = 1
    json.dump(hash, open('count.json', 'w', encoding='utf-8'), ensure_ascii=False)
    json.dump(map, open('map.json', 'w', encoding='utf-8'), ensure_ascii=False)
