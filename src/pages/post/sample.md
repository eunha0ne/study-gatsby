---
title: Array.from()
date: 2019-06-28
tags: ["TIL", "2019"]
---

Array.from() 메서드는 Array-like(유사 배열) 또는 Iterable(이터러블: 순회 가능한) 객체를 얇게 복사해서 새로운 배열로 반환한다. (ES6)

---
* Array.from(arrayLike[, mapFn[, thisArg]])
  * arrayLike: 배열로 변환하고자 하는유사 배열 객체나 반복 가능한 객체
  * mapFn(Opt): 배열의 모든 요소에 대해 호출할 맵핑 함수
  * thisArg(Opt): mapFn 실행 시에 this로 사용할 값