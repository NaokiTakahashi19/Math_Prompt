# 数と式 学習系統グラフ

```mermaid
flowchart LR
  classDef jh1 fill:#E8F4FF,stroke:#4A90E2,color:#111;
  classDef jh2 fill:#EAF7EA,stroke:#4CAF50,color:#111;
  classDef jh3 fill:#FFF2E0,stroke:#F5A623,color:#111;
  subgraph SG_01["jh1 いろいろな計算"]
    N_m_jh1_A_01_15b["1-A-01-15\nいろいろな計算\n四則混合計算"]
    N_m_jh1_A_01_16b["1-A-01-16\nいろいろな計算\n累乗が含まれる計算"]
    N_m_jh1_A_01_17b["1-A-01-17\nいろいろな計算\n分配法則を利用した計算"]
    N_m_jh1_A_01_18b["1-A-01-18\nいろいろな計算\n数の集合（数＞整数＞自然数）"]
    N_m_jh1_A_01_19b["1-A-01-19\nいろいろな計算\n正の数・負の数の利用（表問題）"]
    N_m_jh1_A_01_20b["1-A-01-20\nいろいろな計算\n素数と素因数分解"]
    N_m_jh1_A_01_21b["1-A-01-21\nいろいろな計算\n素因数分解の利用"]
  end
  subgraph SG_02["jh1 乗法と除法"]
    N_m_jh1_A_01_09b["1-A-01-09\n乗法と除法\n正と負の数の乗法"]
    N_m_jh1_A_01_10b["1-A-01-10\n乗法と除法\n乗法の交換法則・結合法則"]
    N_m_jh1_A_01_11b["1-A-01-11\n乗法と除法\n累乗"]
    N_m_jh1_A_01_12b["1-A-01-12\n乗法と除法\n正と負の数の符号が同じ数の除法、符号が異なる数の除法"]
    N_m_jh1_A_01_13b["1-A-01-13\n乗法と除法\n逆数"]
    N_m_jh1_A_01_14b["1-A-01-14\n乗法と除法\n逆数を使った除法"]
  end
  subgraph SG_03["jh1 加法と減法"]
    N_m_jh1_A_01_05b["1-A-01-05\n加法と減法\n正と負の数の加法"]
    N_m_jh1_A_01_06b["1-A-01-06\n加法と減法\n加法の交換法則・結合法則"]
    N_m_jh1_A_01_07b["1-A-01-07\n加法と減法\n正と負の数の減法"]
    N_m_jh1_A_01_08b["1-A-01-08\n加法と減法\n加法と減法の混合"]
  end
  subgraph SG_04["jh1 文字と式"]
    N_m_jh1_A_02_01b["1-A-02-01\n文字と式\n文字を使った式"]
    N_m_jh1_A_02_02b["1-A-02-02\n文字と式\n文字式の表し方"]
    N_m_jh1_A_02_03b["1-A-02-03\n文字と式\nいろいろな数量と文字式"]
    N_m_jh1_A_02_04b["1-A-02-04\n文字と式\n式の値（代入）"]
    N_m_jh1_A_02_05b["1-A-02-05\n文字と式\n項と係数の関係"]
    N_m_jh1_A_02_06b["1-A-02-06\n文字と式\n文字式の加法と減法"]
    N_m_jh1_A_02_07b["1-A-02-07\n文字と式\n1次式の乗法（項が1つ・項が複数・分数）"]
    N_m_jh1_A_02_08b["1-A-02-08\n文字と式\n1次式の除法（項が1つ・項が複数）"]
    N_m_jh1_A_02_09b["1-A-02-09\n文字と式\n1次式の計算（分配法則）"]
    N_m_jh1_A_02_10b["1-A-02-10\n文字と式\n文字式の利用（等式）"]
    N_m_jh1_A_02_11b["1-A-02-11\n文字と式\n文字式の利用（不等式）"]
  end
  subgraph SG_05["jh1 正と負の数"]
    N_m_jh1_A_01_01b["1-A-01-01\n正と負の数\n正と負"]
    N_m_jh1_A_01_02b["1-A-01-02\n正と負の数\n正の数と負の数を量で表す"]
    N_m_jh1_A_01_03b["1-A-01-03\n正と負の数\n数の大小と不等号"]
    N_m_jh1_A_01_04b["1-A-01-04\n正と負の数\n絶対値"]
  end
  subgraph SG_06["jh1 １次方程式"]
    N_m_jh1_A_03_01b["1-A-03-01\n１次方程式\n方程式とその解（代入）①"]
    N_m_jh1_A_03_02b["1-A-03-02\n１次方程式\n方程式とその解（代入）②"]
    N_m_jh1_A_03_03b["1-A-03-03\n１次方程式\n等式の性質（加法性質・減法性質・乗法性質・除法性質）"]
    N_m_jh1_A_03_04b["1-A-03-04\n１次方程式\n移項を利用した１次方程式の解き方"]
    N_m_jh1_A_03_05b["1-A-03-05\n１次方程式\nかっこのある方程式の解き方"]
    N_m_jh1_A_03_06b["1-A-03-06\n１次方程式\n小数が含まれる方程式の解き方"]
    N_m_jh1_A_03_07b["1-A-03-07\n１次方程式\n分数が含まれる方程式の解き方"]
    N_m_jh1_A_03_08b["1-A-03-08\n１次方程式\n比例式"]
    N_m_jh1_A_03_09b["1-A-03-09\n１次方程式\n方程式の解と定数"]
    N_m_jh1_A_03_10b["1-A-03-10\n１次方程式\n代金の問題"]
    N_m_jh1_A_03_11b["1-A-03-11\n１次方程式\n過不足の問題"]
    N_m_jh1_A_03_12b["1-A-03-12\n１次方程式\n速さに関する問題"]
    N_m_jh1_A_03_13b["1-A-03-13\n１次方程式\n割合問題"]
  end
  subgraph SG_07["jh2 多項式の計算"]
    N_m_jh2_A_01_01b["2-A-01-01\n多項式の計算\n多項式と項"]
    N_m_jh2_A_01_02b["2-A-01-02\n多項式の計算\n項の次数"]
    N_m_jh2_A_01_03b["2-A-01-03\n多項式の計算\n式の次数"]
    N_m_jh2_A_01_04b["2-A-01-04\n多項式の計算\n同類項"]
    N_m_jh2_A_01_05b["2-A-01-05\n多項式の計算\n多項式の加法と減法"]
    N_m_jh2_A_01_06b["2-A-01-06\n多項式の計算\n数と多項式の乗法"]
    N_m_jh2_A_01_07b["2-A-01-07\n多項式の計算\n多項式と数の除法"]
    N_m_jh2_A_01_08b["2-A-01-08\n多項式の計算\n分配法則を利用する加法と減法（分数を含まない）"]
    N_m_jh2_A_01_09b["2-A-01-09\n多項式の計算\n分配法則を利用する加法と減法（分数を含む）"]
    N_m_jh2_A_01_10b["2-A-01-10\n多項式の計算\n単項式の乗法"]
    N_m_jh2_A_01_11b["2-A-01-11\n多項式の計算\n単項式の除法"]
    N_m_jh2_A_01_12b["2-A-01-12\n多項式の計算\n単項式の乗法・除法混合"]
    N_m_jh2_A_01_13b["2-A-01-13\n多項式の計算\n式の値"]
  end
  subgraph SG_08["jh2 文字式の利用"]
    N_m_jh2_A_02_01b["2-A-02-01\n文字式の利用\n整数に関するいろいろな性質"]
    N_m_jh2_A_02_02b["2-A-02-02\n文字式の利用\n図形と文字式"]
    N_m_jh2_A_02_03b["2-A-02-03\n文字式の利用\n等式の変形"]
  end
  subgraph SG_09["jh2 連立方程式"]
    N_m_jh2_A_03_01b["2-A-03-01\n連立方程式\n連立方程式とその解"]
    N_m_jh2_A_03_02b["2-A-03-02\n連立方程式\n加減法①2つの式をそのまま加減する"]
    N_m_jh2_A_03_03b["2-A-03-03\n連立方程式\n加減法②1つの式の両辺を何倍かして加減する"]
    N_m_jh2_A_03_04b["2-A-03-04\n連立方程式\n加減法③それぞれの式の両辺を何倍かして加減する"]
    N_m_jh2_A_03_05b["2-A-03-05\n連立方程式\n代入法　1つの式から、x= 〜もしくは、y=〜という形を作り、もう一方の式に代入して解く"]
    N_m_jh2_A_03_06b["2-A-03-06\n連立方程式\nかっこのある連立方程式"]
    N_m_jh2_A_03_07b["2-A-03-07\n連立方程式\n係数に分数を含む連立方程式"]
    N_m_jh2_A_03_08b["2-A-03-08\n連立方程式\n係数に小数を含む連立方程式"]
    N_m_jh2_A_03_09b["2-A-03-09\n連立方程式\nA＝B=Cの形をした連立方程式"]
    N_m_jh2_A_03_10b["2-A-03-10\n連立方程式\n連立方程式の文章題（数、量、代金の問題）"]
    N_m_jh2_A_03_11b["2-A-03-11\n連立方程式\n連立方程式の文章題（数字の問題）"]
    N_m_jh2_A_03_12b["2-A-03-12\n連立方程式\n連立方程式の文章題（速さ、距離、時間に関する問題）"]
    N_m_jh2_A_03_13b["2-A-03-13\n連立方程式\n連立方程式の文章題（割合に関する問題）"]
    N_m_jh2_A_03_14b["2-A-03-14\n連立方程式\n連立方程式の文章題（濃度に関する問題）"]
  end
  subgraph SG_10["jh3 2次方程式"]
    N_m_jh3_A_05_01b["3-A-05-01\n2次方程式\n2次方程式とその解"]
    N_m_jh3_A_05_02b["3-A-05-02\n2次方程式\n因数分解された形式の2次方程式の解き方"]
    N_m_jh3_A_05_03b["3-A-05-03\n2次方程式\n因数分解して解く2次方程式"]
    N_m_jh3_A_05_04b["3-A-05-04\n2次方程式\n平方根を使った2次方程式の解き方"]
    N_m_jh3_A_05_05b["3-A-05-05\n2次方程式\n因数分解できない2次方程式の解き方：平方完成でx^2+2ax=bの形から解く"]
    N_m_jh3_A_05_06b["3-A-05-06\n2次方程式\n2次方程式の解の公式を利用した解き方"]
    N_m_jh3_A_05_07b["3-A-05-07\n2次方程式\n複雑な2次方程式の解き方"]
    N_m_jh3_A_05_08b["3-A-05-08\n2次方程式\n解が与えられた2次方程式"]
    N_m_jh3_A_05_09b["3-A-05-09\n2次方程式\n2次方程式の利用（数の問題）"]
    N_m_jh3_A_05_10b["3-A-05-10\n2次方程式\n2次方程式の利用（図形の問題）"]
    N_m_jh3_A_05_11b["3-A-05-11\n2次方程式\n2次方程式の利用（動点の問題）"]
  end
  subgraph SG_11["jh3 乗法の公式や因数分解の利用"]
    N_m_jh3_A_03_01b["3-A-03-01\n乗法の公式や因数分解の利用\n乗法の公式や因数分解を利用した計算"]
    N_m_jh3_A_03_02b["3-A-03-02\n乗法の公式や因数分解の利用\n乗法の公式や因数分解を利用してから式への値の代入"]
  end
  subgraph SG_12["jh3 因数分解"]
    N_m_jh3_A_02_01b["3-A-02-01\n因数分解\n共通因数のくくりだし"]
    N_m_jh3_A_02_02b["3-A-02-02\n因数分解\n乗法の公式(x + a)(x + b) = x^2 +(a + b)x + abを利用した因数分解"]
    N_m_jh3_A_02_03b["3-A-02-03\n因数分解\n(x + a)^2, (x - a)^2の乗法の公式を利用した因数分解"]
    N_m_jh3_A_02_04b["3-A-02-04\n因数分解\n(a + b)(a - b)の乗法の公式を利用した因数分解"]
    N_m_jh3_A_02_05b["3-A-02-05\n因数分解\n共通因数のくくりだしと乗法の公式を組み合わせた因数分解"]
    N_m_jh3_A_02_06b["3-A-02-06\n因数分解\nおきかえによる因数分解"]
  end
  subgraph SG_13["jh3 多項式の計算"]
    N_m_jh3_A_01_01b["3-A-01-01\n多項式の計算\n単項式と多項式の乗法"]
    N_m_jh3_A_01_02b["3-A-01-02\n多項式の計算\n多項式を単項式でわる除法"]
    N_m_jh3_A_01_03b["3-A-01-03\n多項式の計算\n多項式と多項式の乗法（展開）"]
    N_m_jh3_A_01_04b["3-A-01-04\n多項式の計算\n多項式の展開（同類項を含む）"]
    N_m_jh3_A_01_05b["3-A-01-05\n多項式の計算\n(x + a)(x + b)の展開"]
    N_m_jh3_A_01_06b["3-A-01-06\n多項式の計算\n(x + a)^2の展開"]
    N_m_jh3_A_01_07b["3-A-01-07\n多項式の計算\n(x - a)^2の展開"]
    N_m_jh3_A_01_08b["3-A-01-08\n多項式の計算\n(a + b)(a -b)の展開"]
    N_m_jh3_A_01_09b["3-A-01-09\n多項式の計算\n乗法の公式を利用したいろいろな展開"]
    N_m_jh3_A_01_10b["3-A-01-10\n多項式の計算\n置き換えによる展開"]
  end
  subgraph SG_14["jh3 平方根"]
    N_m_jh3_A_04_01b["3-A-04-01\n平方根\n2乗するとaになる数（有理数）"]
    N_m_jh3_A_04_02b["3-A-04-02\n平方根\n記号を使って平方根を表す"]
    N_m_jh3_A_04_03b["3-A-04-03\n平方根\n根号のついた数を2乗する"]
    N_m_jh3_A_04_04b["3-A-04-04\n平方根\n根号をはずせる根号のついた数"]
    N_m_jh3_A_04_05b["3-A-04-05\n平方根\n平方根の大小"]
    N_m_jh3_A_04_06b["3-A-04-06\n平方根\n有理数と無理数"]
    N_m_jh3_A_04_07b["3-A-04-07\n平方根\n平方根の積と商"]
    N_m_jh3_A_04_08b["3-A-04-08\n平方根\n平方根の変形"]
    N_m_jh3_A_04_09b["3-A-04-09\n平方根\n分母の有理化"]
    N_m_jh3_A_04_10b["3-A-04-10\n平方根\n根号を含む式の乗法や除法"]
    N_m_jh3_A_04_11b["3-A-04-11\n平方根\n根号をふくむ式の加法と減法（根号の中の数が同じ場合）"]
    N_m_jh3_A_04_12b["3-A-04-12\n平方根\n根号をふくむ式の加法と減法（根号の中の数を合わせられる場合）"]
    N_m_jh3_A_04_13b["3-A-04-13\n平方根\n根号をふくむ式の加法と減法（有理化を利用した計算）"]
    N_m_jh3_A_04_14b["3-A-04-14\n平方根\n分配法則を利用した平方根の計算"]
    N_m_jh3_A_04_15b["3-A-04-15\n平方根\n展開の公式を利用した計算"]
    N_m_jh3_A_04_16b["3-A-04-16\n平方根\n平方根の近似値"]
    N_m_jh3_A_04_17b["3-A-04-17\n平方根\n平方根の計算"]
    N_m_jh3_A_04_18b["3-A-04-18\n平方根\n近似値と有効数字"]
  end
  class N_m_jh1_A_01_01b jh1;
  class N_m_jh1_A_01_02b jh1;
  class N_m_jh1_A_01_03b jh1;
  class N_m_jh1_A_01_04b jh1;
  class N_m_jh1_A_01_05b jh1;
  class N_m_jh1_A_01_06b jh1;
  class N_m_jh1_A_01_07b jh1;
  class N_m_jh1_A_01_08b jh1;
  class N_m_jh1_A_01_09b jh1;
  class N_m_jh1_A_01_10b jh1;
  class N_m_jh1_A_01_11b jh1;
  class N_m_jh1_A_01_12b jh1;
  class N_m_jh1_A_01_13b jh1;
  class N_m_jh1_A_01_14b jh1;
  class N_m_jh1_A_01_15b jh1;
  class N_m_jh1_A_01_16b jh1;
  class N_m_jh1_A_01_17b jh1;
  class N_m_jh1_A_01_18b jh1;
  class N_m_jh1_A_01_19b jh1;
  class N_m_jh1_A_01_20b jh1;
  class N_m_jh1_A_01_21b jh1;
  class N_m_jh1_A_02_01b jh1;
  class N_m_jh1_A_02_02b jh1;
  class N_m_jh1_A_02_03b jh1;
  class N_m_jh1_A_02_04b jh1;
  class N_m_jh1_A_02_05b jh1;
  class N_m_jh1_A_02_06b jh1;
  class N_m_jh1_A_02_07b jh1;
  class N_m_jh1_A_02_08b jh1;
  class N_m_jh1_A_02_09b jh1;
  class N_m_jh1_A_02_10b jh1;
  class N_m_jh1_A_02_11b jh1;
  class N_m_jh1_A_03_01b jh1;
  class N_m_jh1_A_03_02b jh1;
  class N_m_jh1_A_03_03b jh1;
  class N_m_jh1_A_03_04b jh1;
  class N_m_jh1_A_03_05b jh1;
  class N_m_jh1_A_03_06b jh1;
  class N_m_jh1_A_03_07b jh1;
  class N_m_jh1_A_03_08b jh1;
  class N_m_jh1_A_03_09b jh1;
  class N_m_jh1_A_03_10b jh1;
  class N_m_jh1_A_03_11b jh1;
  class N_m_jh1_A_03_12b jh1;
  class N_m_jh1_A_03_13b jh1;
  class N_m_jh2_A_01_01b jh2;
  class N_m_jh2_A_01_02b jh2;
  class N_m_jh2_A_01_03b jh2;
  class N_m_jh2_A_01_04b jh2;
  class N_m_jh2_A_01_05b jh2;
  class N_m_jh2_A_01_06b jh2;
  class N_m_jh2_A_01_07b jh2;
  class N_m_jh2_A_01_08b jh2;
  class N_m_jh2_A_01_09b jh2;
  class N_m_jh2_A_01_10b jh2;
  class N_m_jh2_A_01_11b jh2;
  class N_m_jh2_A_01_12b jh2;
  class N_m_jh2_A_01_13b jh2;
  class N_m_jh2_A_02_01b jh2;
  class N_m_jh2_A_02_02b jh2;
  class N_m_jh2_A_02_03b jh2;
  class N_m_jh2_A_03_01b jh2;
  class N_m_jh2_A_03_02b jh2;
  class N_m_jh2_A_03_03b jh2;
  class N_m_jh2_A_03_04b jh2;
  class N_m_jh2_A_03_05b jh2;
  class N_m_jh2_A_03_06b jh2;
  class N_m_jh2_A_03_07b jh2;
  class N_m_jh2_A_03_08b jh2;
  class N_m_jh2_A_03_09b jh2;
  class N_m_jh2_A_03_10b jh2;
  class N_m_jh2_A_03_11b jh2;
  class N_m_jh2_A_03_12b jh2;
  class N_m_jh2_A_03_13b jh2;
  class N_m_jh2_A_03_14b jh2;
  class N_m_jh3_A_01_01b jh3;
  class N_m_jh3_A_01_02b jh3;
  class N_m_jh3_A_01_03b jh3;
  class N_m_jh3_A_01_04b jh3;
  class N_m_jh3_A_01_05b jh3;
  class N_m_jh3_A_01_06b jh3;
  class N_m_jh3_A_01_07b jh3;
  class N_m_jh3_A_01_08b jh3;
  class N_m_jh3_A_01_09b jh3;
  class N_m_jh3_A_01_10b jh3;
  class N_m_jh3_A_02_01b jh3;
  class N_m_jh3_A_02_02b jh3;
  class N_m_jh3_A_02_03b jh3;
  class N_m_jh3_A_02_04b jh3;
  class N_m_jh3_A_02_05b jh3;
  class N_m_jh3_A_02_06b jh3;
  class N_m_jh3_A_03_01b jh3;
  class N_m_jh3_A_03_02b jh3;
  class N_m_jh3_A_04_01b jh3;
  class N_m_jh3_A_04_02b jh3;
  class N_m_jh3_A_04_03b jh3;
  class N_m_jh3_A_04_04b jh3;
  class N_m_jh3_A_04_05b jh3;
  class N_m_jh3_A_04_06b jh3;
  class N_m_jh3_A_04_07b jh3;
  class N_m_jh3_A_04_08b jh3;
  class N_m_jh3_A_04_09b jh3;
  class N_m_jh3_A_04_10b jh3;
  class N_m_jh3_A_04_11b jh3;
  class N_m_jh3_A_04_12b jh3;
  class N_m_jh3_A_04_13b jh3;
  class N_m_jh3_A_04_14b jh3;
  class N_m_jh3_A_04_15b jh3;
  class N_m_jh3_A_04_16b jh3;
  class N_m_jh3_A_04_17b jh3;
  class N_m_jh3_A_04_18b jh3;
  class N_m_jh3_A_05_01b jh3;
  class N_m_jh3_A_05_02b jh3;
  class N_m_jh3_A_05_03b jh3;
  class N_m_jh3_A_05_04b jh3;
  class N_m_jh3_A_05_05b jh3;
  class N_m_jh3_A_05_06b jh3;
  class N_m_jh3_A_05_07b jh3;
  class N_m_jh3_A_05_08b jh3;
  class N_m_jh3_A_05_09b jh3;
  class N_m_jh3_A_05_10b jh3;
  class N_m_jh3_A_05_11b jh3;
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_02b
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_03b
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_04b
  N_m_jh1_A_01_03b --> N_m_jh1_A_01_04b
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_05b
  N_m_jh1_A_01_04b --> N_m_jh1_A_01_05b
  N_m_jh1_A_01_05b --> N_m_jh1_A_01_06b
  N_m_jh1_A_01_05b --> N_m_jh1_A_01_07b
  N_m_jh1_A_01_06b --> N_m_jh1_A_01_08b
  N_m_jh1_A_01_07b --> N_m_jh1_A_01_08b
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_09b
  N_m_jh1_A_01_04b --> N_m_jh1_A_01_09b
  N_m_jh1_A_01_09b --> N_m_jh1_A_01_10b
  N_m_jh1_A_01_09b --> N_m_jh1_A_01_11b
  N_m_jh1_A_01_10b --> N_m_jh1_A_01_11b
  N_m_jh1_A_01_09b --> N_m_jh1_A_01_12b
  N_m_jh1_A_01_09b --> N_m_jh1_A_01_13b
  N_m_jh1_A_01_12b --> N_m_jh1_A_01_14b
  N_m_jh1_A_01_13b --> N_m_jh1_A_01_14b
  N_m_jh1_A_01_08b --> N_m_jh1_A_01_15b
  N_m_jh1_A_01_10b --> N_m_jh1_A_01_15b
  N_m_jh1_A_01_12b --> N_m_jh1_A_01_15b
  N_m_jh1_A_01_11b --> N_m_jh1_A_01_16b
  N_m_jh1_A_01_15b --> N_m_jh1_A_01_16b
  N_m_jh1_A_01_10b --> N_m_jh1_A_01_17b
  N_m_jh1_A_01_15b --> N_m_jh1_A_01_17b
  N_m_jh1_A_01_01b --> N_m_jh1_A_01_18b
  N_m_jh1_A_01_02b --> N_m_jh1_A_01_19b
  N_m_jh1_A_01_08b --> N_m_jh1_A_01_19b
  N_m_jh1_A_01_18b --> N_m_jh1_A_01_20b
  N_m_jh1_A_01_20b --> N_m_jh1_A_01_21b
  N_m_jh1_A_01_01b --> N_m_jh1_A_02_01b
  N_m_jh1_A_02_01b --> N_m_jh1_A_02_02b
  N_m_jh1_A_01_09b --> N_m_jh1_A_02_02b
  N_m_jh1_A_02_01b --> N_m_jh1_A_02_03b
  N_m_jh1_A_02_02b --> N_m_jh1_A_02_03b
  N_m_jh1_A_02_02b --> N_m_jh1_A_02_04b
  N_m_jh1_A_01_15b --> N_m_jh1_A_02_04b
  N_m_jh1_A_02_02b --> N_m_jh1_A_02_05b
  N_m_jh1_A_02_05b --> N_m_jh1_A_02_06b
  N_m_jh1_A_01_08b --> N_m_jh1_A_02_06b
  N_m_jh1_A_02_02b --> N_m_jh1_A_02_07b
  N_m_jh1_A_01_17b --> N_m_jh1_A_02_07b
  N_m_jh1_A_02_07b --> N_m_jh1_A_02_08b
  N_m_jh1_A_01_14b --> N_m_jh1_A_02_08b
  N_m_jh1_A_02_06b --> N_m_jh1_A_02_09b
  N_m_jh1_A_02_07b --> N_m_jh1_A_02_09b
  N_m_jh1_A_01_17b --> N_m_jh1_A_02_09b
  N_m_jh1_A_02_03b --> N_m_jh1_A_02_10b
  N_m_jh1_A_02_09b --> N_m_jh1_A_02_10b
  N_m_jh1_A_01_03b --> N_m_jh1_A_02_11b
  N_m_jh1_A_02_03b --> N_m_jh1_A_02_11b
  N_m_jh1_A_02_04b --> N_m_jh1_A_03_01b
  N_m_jh1_A_02_10b --> N_m_jh1_A_03_01b
  N_m_jh1_A_03_01b --> N_m_jh1_A_03_02b
  N_m_jh1_A_02_10b --> N_m_jh1_A_03_03b
  N_m_jh1_A_03_01b --> N_m_jh1_A_03_03b
  N_m_jh1_A_03_03b --> N_m_jh1_A_03_04b
  N_m_jh1_A_02_09b --> N_m_jh1_A_03_05b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_05b
  N_m_jh1_A_01_15b --> N_m_jh1_A_03_06b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_06b
  N_m_jh1_A_01_14b --> N_m_jh1_A_03_07b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_07b
  N_m_jh1_A_02_10b --> N_m_jh1_A_03_08b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_08b
  N_m_jh1_A_02_04b --> N_m_jh1_A_03_09b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_09b
  N_m_jh1_A_02_03b --> N_m_jh1_A_03_10b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_10b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_11b
  N_m_jh1_A_03_10b --> N_m_jh1_A_03_11b
  N_m_jh1_A_02_03b --> N_m_jh1_A_03_12b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_12b
  N_m_jh1_A_02_03b --> N_m_jh1_A_03_13b
  N_m_jh1_A_03_04b --> N_m_jh1_A_03_13b
  N_m_jh1_A_02_05b --> N_m_jh2_A_01_01b
  N_m_jh1_A_02_02b --> N_m_jh2_A_01_02b
  N_m_jh2_A_01_01b --> N_m_jh2_A_01_02b
  N_m_jh2_A_01_02b --> N_m_jh2_A_01_03b
  N_m_jh2_A_01_01b --> N_m_jh2_A_01_04b
  N_m_jh1_A_02_06b --> N_m_jh2_A_01_05b
  N_m_jh2_A_01_04b --> N_m_jh2_A_01_05b
  N_m_jh1_A_02_07b --> N_m_jh2_A_01_06b
  N_m_jh2_A_01_05b --> N_m_jh2_A_01_06b
  N_m_jh1_A_02_08b --> N_m_jh2_A_01_07b
  N_m_jh2_A_01_06b --> N_m_jh2_A_01_07b
  N_m_jh2_A_01_05b --> N_m_jh2_A_01_08b
  N_m_jh2_A_01_06b --> N_m_jh2_A_01_08b
  N_m_jh1_A_01_14b --> N_m_jh2_A_01_09b
  N_m_jh2_A_01_08b --> N_m_jh2_A_01_09b
  N_m_jh1_A_01_11b --> N_m_jh2_A_01_10b
  N_m_jh1_A_01_09b --> N_m_jh2_A_01_10b
  N_m_jh2_A_01_02b --> N_m_jh2_A_01_10b
  N_m_jh1_A_01_14b --> N_m_jh2_A_01_11b
  N_m_jh2_A_01_10b --> N_m_jh2_A_01_11b
  N_m_jh2_A_01_10b --> N_m_jh2_A_01_12b
  N_m_jh2_A_01_11b --> N_m_jh2_A_01_12b
  N_m_jh1_A_02_04b --> N_m_jh2_A_01_13b
  N_m_jh2_A_01_10b --> N_m_jh2_A_01_13b
  N_m_jh1_A_02_10b --> N_m_jh2_A_02_01b
  N_m_jh2_A_01_05b --> N_m_jh2_A_02_01b
  N_m_jh1_A_02_03b --> N_m_jh2_A_02_02b
  N_m_jh2_A_01_06b --> N_m_jh2_A_02_02b
  N_m_jh1_A_03_04b --> N_m_jh2_A_02_03b
  N_m_jh2_A_01_05b --> N_m_jh2_A_02_03b
  N_m_jh1_A_03_01b --> N_m_jh2_A_03_01b
  N_m_jh2_A_02_03b --> N_m_jh2_A_03_01b
  N_m_jh1_A_03_03b --> N_m_jh2_A_03_02b
  N_m_jh2_A_03_01b --> N_m_jh2_A_03_02b
  N_m_jh2_A_03_02b --> N_m_jh2_A_03_03b
  N_m_jh2_A_03_03b --> N_m_jh2_A_03_04b
  N_m_jh1_A_03_04b --> N_m_jh2_A_03_05b
  N_m_jh2_A_03_01b --> N_m_jh2_A_03_05b
  N_m_jh1_A_03_05b --> N_m_jh2_A_03_06b
  N_m_jh2_A_03_02b --> N_m_jh2_A_03_06b
  N_m_jh1_A_03_07b --> N_m_jh2_A_03_07b
  N_m_jh2_A_03_02b --> N_m_jh2_A_03_07b
  N_m_jh1_A_03_06b --> N_m_jh2_A_03_08b
  N_m_jh2_A_03_02b --> N_m_jh2_A_03_08b
  N_m_jh2_A_03_01b --> N_m_jh2_A_03_09b
  N_m_jh2_A_03_05b --> N_m_jh2_A_03_09b
  N_m_jh1_A_03_10b --> N_m_jh2_A_03_10b
  N_m_jh2_A_03_02b --> N_m_jh2_A_03_10b
  N_m_jh2_A_03_05b --> N_m_jh2_A_03_10b
  N_m_jh2_A_03_10b --> N_m_jh2_A_03_11b
  N_m_jh1_A_03_12b --> N_m_jh2_A_03_12b
  N_m_jh2_A_03_10b --> N_m_jh2_A_03_12b
  N_m_jh1_A_03_13b --> N_m_jh2_A_03_13b
  N_m_jh2_A_03_10b --> N_m_jh2_A_03_13b
  N_m_jh2_A_03_13b --> N_m_jh2_A_03_14b
  N_m_jh1_A_02_09b --> N_m_jh3_A_01_01b
  N_m_jh2_A_01_06b --> N_m_jh3_A_01_01b
  N_m_jh2_A_01_07b --> N_m_jh3_A_01_02b
  N_m_jh3_A_01_01b --> N_m_jh3_A_01_02b
  N_m_jh2_A_01_05b --> N_m_jh3_A_01_03b
  N_m_jh3_A_01_01b --> N_m_jh3_A_01_03b
  N_m_jh2_A_01_04b --> N_m_jh3_A_01_04b
  N_m_jh3_A_01_03b --> N_m_jh3_A_01_04b
  N_m_jh3_A_01_03b --> N_m_jh3_A_01_05b
  N_m_jh3_A_01_03b --> N_m_jh3_A_01_06b
  N_m_jh1_A_01_07b --> N_m_jh3_A_01_07b
  N_m_jh3_A_01_03b --> N_m_jh3_A_01_07b
  N_m_jh3_A_01_03b --> N_m_jh3_A_01_08b
  N_m_jh3_A_01_05b --> N_m_jh3_A_01_09b
  N_m_jh3_A_01_06b --> N_m_jh3_A_01_09b
  N_m_jh3_A_01_07b --> N_m_jh3_A_01_09b
  N_m_jh3_A_01_08b --> N_m_jh3_A_01_09b
  N_m_jh3_A_01_09b --> N_m_jh3_A_01_10b
  N_m_jh2_A_01_04b --> N_m_jh3_A_02_01b
  N_m_jh3_A_01_01b --> N_m_jh3_A_02_01b
  N_m_jh3_A_01_05b --> N_m_jh3_A_02_02b
  N_m_jh3_A_01_06b --> N_m_jh3_A_02_03b
  N_m_jh3_A_01_07b --> N_m_jh3_A_02_03b
  N_m_jh3_A_01_08b --> N_m_jh3_A_02_04b
  N_m_jh3_A_02_01b --> N_m_jh3_A_02_05b
  N_m_jh3_A_02_02b --> N_m_jh3_A_02_05b
  N_m_jh3_A_02_03b --> N_m_jh3_A_02_05b
  N_m_jh3_A_02_04b --> N_m_jh3_A_02_05b
  N_m_jh3_A_01_10b --> N_m_jh3_A_02_06b
  N_m_jh3_A_02_05b --> N_m_jh3_A_02_06b
  N_m_jh1_A_01_15b --> N_m_jh3_A_03_01b
  N_m_jh3_A_01_09b --> N_m_jh3_A_03_01b
  N_m_jh3_A_02_05b --> N_m_jh3_A_03_01b
  N_m_jh1_A_02_04b --> N_m_jh3_A_03_02b
  N_m_jh3_A_03_01b --> N_m_jh3_A_03_02b
  N_m_jh1_A_01_04b --> N_m_jh3_A_04_01b
  N_m_jh1_A_01_11b --> N_m_jh3_A_04_01b
  N_m_jh3_A_04_01b --> N_m_jh3_A_04_02b
  N_m_jh1_A_01_11b --> N_m_jh3_A_04_03b
  N_m_jh3_A_04_02b --> N_m_jh3_A_04_03b
  N_m_jh1_A_01_20b --> N_m_jh3_A_04_04b
  N_m_jh3_A_04_02b --> N_m_jh3_A_04_04b
  N_m_jh1_A_01_03b --> N_m_jh3_A_04_05b
  N_m_jh3_A_04_02b --> N_m_jh3_A_04_05b
  N_m_jh1_A_01_18b --> N_m_jh3_A_04_06b
  N_m_jh3_A_04_02b --> N_m_jh3_A_04_06b
  N_m_jh1_A_01_09b --> N_m_jh3_A_04_07b
  N_m_jh1_A_01_12b --> N_m_jh3_A_04_07b
  N_m_jh3_A_04_04b --> N_m_jh3_A_04_07b
  N_m_jh3_A_04_04b --> N_m_jh3_A_04_08b
  N_m_jh3_A_04_07b --> N_m_jh3_A_04_08b
  N_m_jh3_A_04_07b --> N_m_jh3_A_04_09b
  N_m_jh3_A_04_08b --> N_m_jh3_A_04_09b
  N_m_jh3_A_04_07b --> N_m_jh3_A_04_10b
  N_m_jh3_A_04_08b --> N_m_jh3_A_04_10b
  N_m_jh3_A_04_09b --> N_m_jh3_A_04_10b
  N_m_jh2_A_01_04b --> N_m_jh3_A_04_11b
  N_m_jh3_A_04_04b --> N_m_jh3_A_04_11b
  N_m_jh3_A_04_04b --> N_m_jh3_A_04_12b
  N_m_jh3_A_04_11b --> N_m_jh3_A_04_12b
  N_m_jh3_A_04_09b --> N_m_jh3_A_04_13b
  N_m_jh3_A_04_12b --> N_m_jh3_A_04_13b
  N_m_jh1_A_01_17b --> N_m_jh3_A_04_14b
  N_m_jh3_A_04_10b --> N_m_jh3_A_04_14b
  N_m_jh3_A_04_11b --> N_m_jh3_A_04_14b
  N_m_jh3_A_01_09b --> N_m_jh3_A_04_15b
  N_m_jh3_A_04_14b --> N_m_jh3_A_04_15b
  N_m_jh3_A_04_02b --> N_m_jh3_A_04_16b
  N_m_jh3_A_04_10b --> N_m_jh3_A_04_17b
  N_m_jh3_A_04_12b --> N_m_jh3_A_04_17b
  N_m_jh3_A_04_08b --> N_m_jh3_A_04_18b
  N_m_jh3_A_04_09b --> N_m_jh3_A_04_18b
  N_m_jh3_A_04_16b --> N_m_jh3_A_04_18b
  N_m_jh1_A_03_01b --> N_m_jh3_A_05_01b
  N_m_jh3_A_01_04b --> N_m_jh3_A_05_01b
  N_m_jh3_A_02_01b --> N_m_jh3_A_05_02b
  N_m_jh3_A_05_01b --> N_m_jh3_A_05_02b
  N_m_jh3_A_02_02b --> N_m_jh3_A_05_03b
  N_m_jh3_A_02_03b --> N_m_jh3_A_05_03b
  N_m_jh3_A_02_04b --> N_m_jh3_A_05_03b
  N_m_jh3_A_05_02b --> N_m_jh3_A_05_03b
  N_m_jh3_A_04_02b --> N_m_jh3_A_05_04b
  N_m_jh3_A_05_01b --> N_m_jh3_A_05_04b
  N_m_jh3_A_01_06b --> N_m_jh3_A_05_05b
  N_m_jh3_A_05_04b --> N_m_jh3_A_05_05b
  N_m_jh3_A_04_10b --> N_m_jh3_A_05_06b
  N_m_jh3_A_05_05b --> N_m_jh3_A_05_06b
  N_m_jh3_A_01_04b --> N_m_jh3_A_05_07b
  N_m_jh3_A_05_03b --> N_m_jh3_A_05_07b
  N_m_jh3_A_05_06b --> N_m_jh3_A_05_07b
  N_m_jh1_A_02_04b --> N_m_jh3_A_05_08b
  N_m_jh3_A_05_03b --> N_m_jh3_A_05_08b
  N_m_jh1_A_03_10b --> N_m_jh3_A_05_09b
  N_m_jh3_A_05_07b --> N_m_jh3_A_05_09b
  N_m_jh3_A_05_07b --> N_m_jh3_A_05_10b
  N_m_jh1_A_03_12b --> N_m_jh3_A_05_11b
  N_m_jh3_A_05_07b --> N_m_jh3_A_05_11b
```
