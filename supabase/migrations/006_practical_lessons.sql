begin;
-- KANJIDIC2 readings and stroke counts adapted under EDRDG CC BY-SA 4.0.
-- The learning levels and Indonesian glosses are curated for Kitsunesia.
insert into public.kanji(level,character,onyomi,kunyomi,meaning,strokes,examples,stroke_path) values
('N5','一','イチ、イツ','ひと、ひとつ','satu','1','一人（ひとり） · 一万円（いちまんえん）','04e00.svg'),
('N5','二','ニ、ジ','ふた、ふたつ、ふたたび','dua','2','二人（ふたり）','04e8c.svg'),
('N5','三','サン、ゾウ','み、みつ、みっつ','tiga','3','三月（さんがつ）','04e09.svg'),
('N5','四','シ','よ、よつ、よっつ、よん','empat','5','四月（しがつ）','056db.svg'),
('N5','五','ゴ','いつ、いつつ','lima','4','五月（ごがつ） · 五分（ごふん）','04e94.svg'),
('N5','六','ロク、リク','む、むつ、むっつ、むい','enam','4','六月（ろくがつ）','0516d.svg'),
('N5','七','シチ','なな、ななつ、なの','tujuh','2','七月（しちがつ）','04e03.svg'),
('N5','八','ハチ','や、やつ、やっつ、よう','delapan','2','八月（はちがつ）','0516b.svg'),
('N5','九','キュウ、ク','ここの、ここのつ','sembilan','2','九月（くがつ）','04e5d.svg'),
('N5','十','ジュウ、ジッ、ジュッ','とお、と','sepuluh','2','十月（じゅうがつ）','05341.svg'),
('N5','百','ヒャク、ビャク','もも','ratus','6','百円（ひゃくえん）','0767e.svg'),
('N5','千','セン','ち','ribu','3','千円（せんえん）','05343.svg'),
('N5','万','マン、バン','よろず','puluh ribu','3','一万円（いちまんえん）','04e07.svg'),
('N5','円','エン','まるい、まる、まど、まどか、まろやか','yen','4','百円（ひゃくえん） · 千円（せんえん）','05186.svg'),
('N5','年','ネン','とし','tahun','6','来年（らいねん）','05e74.svg'),
('N5','時','ジ','とき、どき','jam','10','時間（じかん） · 何時（なんじ）','06642.svg'),
('N5','分','ブン、フン、ブ','わける、わけ、わかれる、わかる、わかつ','menit','4','五分（ごふん） · 半分（はんぶん）','05206.svg'),
('N5','半','ハン','なかば','setengah','5','半分（はんぶん）','0534a.svg'),
('N5','週','シュウ','','pekan','11','来週（らいしゅう）','09031.svg'),
('N5','今','コン、キン','いま','sekarang','4','今朝（けさ）','04eca.svg'),
('N5','先','セン','さき、まず','sebelumnya','6','先生（せんせい）','05148.svg'),
('N5','毎','マイ','ごと、ごとに','setiap','6','毎日（まいにち）','06bce.svg'),
('N5','何','カ','なに、なん、なに、なん','apa','7','何時（なんじ）','04f55.svg'),
('N5','上','ジョウ、ショウ、シャン','うえ、うえ、うわ、かみ、あげる、あげる、あがる、あがる、あがり、あがり、のぼる、のぼり、のぼせる、のぼす、たてまつる','atas','3','上（うえ）','04e0a.svg'),
('N5','下','カ、ゲ','した、しも、もと、さげる、さがる、くだる、くだり、くだす、くだす、くださる、おろす、おりる','bawah','3','下（した）','04e0b.svg'),
('N5','中','チュウ','なか、うち、あたる','tengah','4','中（なか）','04e2d.svg'),
('N5','外','ガイ、ゲ','そと、ほか、はずす、はずれる、と','luar','5','外（そと）','05916.svg'),
('N5','左','サ、シャ','ひだり','kiri','5','左（ひだり）','05de6.svg'),
('N5','右','ウ、ユウ','みぎ','kanan','5','右（みぎ）','053f3.svg'),
('N5','前','ゼン','まえ、まえ','depan','9','午前（ごぜん） · 名前（なまえ）','0524d.svg'),
('N5','後','ゴ、コウ','のち、うしろ、うしろ、あと、おくれる','belakang','9','午後（ごご）','05f8c.svg'),
('N5','東','トウ','ひがし','timur','8','東（ひがし）','06771.svg'),
('N5','西','セイ、サイ、ス','にし','barat','6','西（にし）','0897f.svg'),
('N5','南','ナン、ナ','みなみ','selatan','9','南（みなみ）','05357.svg'),
('N5','北','ホク','きた','utara','5','北（きた）','05317.svg'),
('N5','口','コウ、ク','くち','mulut','3','入口（いりぐち）','053e3.svg'),
('N5','目','モク、ボク','め、め、ま','mata','5','目（め）','076ee.svg'),
('N5','耳','ジ','みみ','telinga','6','耳（みみ）','08033.svg'),
('N5','手','シュ、ズ','て、て、て、た','tangan','4','手（て）','0624b.svg'),
('N5','足','ソク','あし、たりる、たる、たす','kaki','7','足（あし）','08db3.svg'),
('N5','力','リョク、リキ、リイ','ちから','kekuatan','2','力（ちから） · 能力（のうりょく）','0529b.svg'),
('N5','男','ダン、ナン','おとこ、お','laki-laki','7','男（おとこ）','07537.svg'),
('N5','女','ジョ、ニョ、ニョウ','おんな、め','perempuan','3','女（おんな）','05973.svg'),
('N5','子','シ、ス、ツ','こ、こ、ね','anak','3','子ども（こども）','05b50.svg'),
('N5','父','フ','ちち','ayah','4','父（ちち）','07236.svg'),
('N5','母','ボ','はは、も','ibu','5','母（はは）','06bcd.svg'),
('N5','友','ユウ','とも','teman','4','友達（ともだち）','053cb.svg'),
('N5','名','メイ、ミョウ','な、な','nama','6','名前（なまえ）','0540d.svg'),
('N5','水','スイ','みず、みず','air','4','水（みず）','06c34.svg'),
('N5','火','カ','ひ、び、ほ','api','4','火（ひ）','0706b.svg'),
('N5','木','ボク、モク','き、こ','pohon','4','木（き）','06728.svg'),
('N5','金','キン、コン、ゴン','かね、かな、がね','emas','8','お金（おかね） · 税金（ぜいきん）','091d1.svg'),
('N5','土','ド、ト','つち','tanah','3','土（つち）','0571f.svg'),
('N5','空','クウ','そら、あく、あき、あける、から、すく、すかす、むなしい','langit','8','空（そら）','07a7a.svg'),
('N5','雨','ウ','あめ、あま、さめ','hujan','8','雨（あめ）','096e8.svg'),
('N5','花','カ、ケ','はな','bunga','7','花（はな）','082b1.svg'),
('N5','田','デン','た','sawah','5','田（た）','07530.svg'),
('N5','石','セキ、シャク、コク','いし','batu','5','石（いし）','077f3.svg'),
('N5','白','ハク、ビャク','しろ、しら、しろい','putih','5','白い（しろい）','0767d.svg'),
('N5','赤','セキ、シャク','あか、あか、あかい、あからむ、あからめる','merah','7','赤い（あかい）','08d64.svg'),
('N5','青','セイ、ショウ','あお、あお、あおい','biru','8','青い（あおい）','09752.svg'),
('N5','黒','コク','くろ、くろずむ、くろい','hitam','11','黒い（くろい）','09ed2.svg'),
('N5','大','ダイ、タイ','おお、おおきい、おおいに','besar','3','拡大（かくだい） · 大きい（おおきい）','05927.svg'),
('N5','小','ショウ','ちいさい、こ、お、さ','kecil','3','縮小（しゅくしょう） · 小さい（ちいさい）','05c0f.svg'),
('N5','多','タ','おおい、まさに、まさる','banyak','6','多い（おおい）','0591a.svg'),
('N5','少','ショウ','すくない、すこし','sedikit','4','少ない（すくない）','05c11.svg'),
('N5','新','シン','あたらしい、あらた、あら、にい','baru','13','新しい（あたらしい）','065b0.svg'),
('N5','古','コ','ふるい、ふる、ふるす','lama','5','古い（ふるい）','053e4.svg'),
('N5','高','コウ','たかい、たか、だか、たかまる、たかめる','tinggi','10','高い（たかい）','09ad8.svg'),
('N5','安','アン','やすい、やすまる、やす、やすらか','murah','6','安い（やすい）','05b89.svg'),
('N5','長','チョウ','ながい、おさ','panjang','8','長い（ながい）','09577.svg'),
('N5','本','ホン','もと','buku','5','本（ほん） · 日本語（にほんご）','0672c.svg'),
('N5','学','ガク','まなぶ','belajar','8','学校（がっこう） · 学生（がくせい）','05b66.svg'),
('N5','校','コウ、キョウ','','sekolah','10','学校（がっこう）','06821.svg'),
('N5','生','セイ、ショウ','いきる、いかす、いける、うまれる、うまれる、うまれ、うまれ、うむ、おう、はえる、はやす、き、なま、なま、なる、なす、むす、う','hidup','5','先生（せんせい） · 学生（がくせい）','0751f.svg'),
('N5','文','ブン、モン','ふみ、あや','kalimat','4','文（ぶん） · 文字（もじ）','06587.svg'),
('N5','字','ジ','あざ、あざな、な','huruf','6','文字（もじ）','05b57.svg'),
('N5','言','ゲン、ゴン','いう、こと','berkata','7','言う（いう）','08a00.svg'),
('N5','語','ゴ','かたる、かたらう','bahasa','14','日本語（にほんご）','08a9e.svg'),
('N5','話','ワ','はなす、はなし','bicara','13','話す（はなす）','08a71.svg'),
('N5','読','ドク、トク、トウ','よむ、よみ','membaca','14','読む（よむ）','08aad.svg'),
('N5','書','ショ','かく、がき、がき','menulis','10','書く（かく） · 図書館（としょかん）','066f8.svg'),
('N5','聞','ブン、モン','きく、きこえる','mendengar','14','聞く（きく）','0805e.svg'),
('N5','見','ケン','みる、みえる、みせる','melihat','7','見る（みる）','0898b.svg'),
('N5','行','コウ、ギョウ、アン','いく、ゆく、ゆき、ゆき、いき、いき、おこなう、おこなう','pergi','6','行く（いく）','0884c.svg'),
('N5','来','ライ、タイ','くる、きたる、きたす、きたす、きたる、き、こ','datang','7','来年（らいねん） · 来週（らいしゅう）','06765.svg'),
('N5','帰','キ','かえる、かえす、おくる、とつぐ','pulang','10','帰る（かえる）','05e30.svg'),
('N5','食','ショク、ジキ','くう、くらう、たべる、はむ','makan','9','食べる（たべる）','098df.svg'),
('N5','飲','イン、オン','のむ、のみ','minum','12','飲む（のむ）','098f2.svg'),
('N5','買','バイ','かう','membeli','12','買う（かう）','08cb7.svg'),
('N5','出','シュツ、スイ','でる、で、だす、だす、いでる、いだす','keluar','5','出る（でる）','051fa.svg'),
('N5','入','ニュウ、ジュ','いる、いる、いり、いれる、いれ、はいる','masuk','2','入口（いりぐち） · 入る（はいる）','05165.svg'),
('N5','休','キュウ','やすむ、やすまる、やすめる','istirahat','6','休む（やすむ）','04f11.svg'),
('N5','会','カイ、エ','あう、あわせる、あつまる','bertemu','6','会う（あう） · 会議（かいぎ）','04f1a.svg'),
('N5','車','シャ','くるま','mobil','7','車（くるま） · 電車（でんしゃ）','08eca.svg'),
('N5','電','デン','','listrik','13','電車（でんしゃ）','096fb.svg'),
('N5','道','ドウ、トウ','みち、いう','jalan','12','道（みち）','09053.svg'),
('N5','国','コク','くに','negara','8','国（くに）','056fd.svg'),
('N5','店','テン','みせ、たな','toko','8','店（みせ）','05e97.svg'),
('N5','家','カ、ケ','いえ、や、うち','rumah','10','家（いえ）','05bb6.svg'),
('N5','魚','ギョ','うお、さかな、ざかな','ikan','11','魚（さかな）','09b5a.svg'),
('N5','犬','ケン','いぬ、いぬ','anjing','4','犬（いぬ）','072ac.svg'),
('N5','鳥','チョウ','とり','burung','11','鳥（とり）','09ce5.svg'),
('N4','住','ジュウ、ヂュウ、チュウ','すむ、すまう、ずまい','tinggal','7','住所（じゅうしょ）','04f4f.svg'),
('N4','作','サク、サ','つくる、つくり、づくり','membuat','7','作る（つくる）','04f5c.svg'),
('N4','使','シ','つかう、つかい、つかい、づかい','menggunakan','8','使う（つかう）','04f7f.svg'),
('N4','働','ドウ','はたらく','bekerja','13','働く（はたらく）','050cd.svg'),
('N4','勉','ベン','つとめる','berusaha','10','勉強（べんきょう）','052c9.svg'),
('N4','強','キョウ、ゴウ','つよい、つよまる、つよめる、しいる、こわい','kuat','11','勉強（べんきょう）','05f37.svg'),
('N4','始','シ','はじめる、はじめる、はじまる','mulai','8','始まる（はじまる）','059cb.svg'),
('N4','終','シュウ','おわる、おわる、おわる、おえる、つい、ついに','selesai','11','終わる（おわる）','07d42.svg'),
('N4','開','カイ','ひらく、ひらき、びらき、ひらける、あく、あける','membuka','12','開く（ひらく）','0958b.svg'),
('N4','閉','ヘイ','とじる、とざす、しめる、しまる、たてる','menutup','11','閉める（しめる）','09589.svg'),
('N4','送','ソウ','おくる','mengirim','9','送る（おくる）','09001.svg'),
('N4','待','タイ','まつ、まち','menunggu','9','待つ（まつ）','05f85.svg'),
('N4','持','ジ','もつ、もち、もてる','membawa','9','持つ（もつ）','06301.svg'),
('N4','歩','ホ、ブ、フ','あるく、あゆむ','berjalan','8','歩く（あるく）','06b69.svg'),
('N4','走','ソウ','はしる','berlari','7','走る（はしる）','08d70.svg'),
('N4','立','リツ、リュウ、リットル','たつ、たつ、たち、たてる、たてる、たて、たて、たて、だて、だてる','berdiri','5','立つ（たつ）','07acb.svg'),
('N4','座','ザ','すわる','duduk','10','座る（すわる）','05ea7.svg'),
('N4','速','ソク','はやい、はや、はやめる、すみやか','cepat','10','速い（はやい）','0901f.svg'),
('N4','遅','チ','おくれる、おくらす、おそい','lambat','12','遅い（おそい）','09045.svg'),
('N4','運','ウン','はこぶ','mengangkut','12','運転（うんてん）','0904b.svg'),
('N4','転','テン','ころがる、ころげる、ころがす、ころぶ、まろぶ、うたた、うつる、くるめく','berputar','11','運転（うんてん）','08ee2.svg'),
('N4','通','ツウ、ツ','とおる、とおり、とおり、どおり、とおす、とおし、どおし、かよう','melintas','10','通る（とおる）','0901a.svg'),
('N4','館','カン','やかた、たて','gedung','16','図書館（としょかん）','09928.svg'),
('N4','町','チョウ','まち','kota kecil','7','町（まち）','0753a.svg'),
('N4','村','ソン','むら','desa','7','村（むら）','06751.svg'),
('N4','室','シツ','むろ','ruangan','9','教室（きょうしつ）','05ba4.svg'),
('N4','病','ビョウ、ヘイ','やむ、やみ、やまい','sakit','10','病院（びょういん）','075c5.svg'),
('N4','院','イン','','lembaga','10','病院（びょういん）','09662.svg'),
('N4','薬','ヤク','くすり','obat','16','薬（くすり）','085ac.svg'),
('N4','服','フク','','pakaian','8','服（ふく）','0670d.svg'),
('N3','政','セイ、ショウ','まつりごと、まん','pemerintahan','9','政治（せいじ）','0653f.svg'),
('N3','経','ケイ、キョウ、キン','へる、たつ、たていと、はかる、のり','melalui','11','経済（けいざい）','07d4c.svg'),
('N3','済','サイ、セイ','すむ、ずみ、ずみ、すまない、すます、すます、すくう、なす、わたし、わたる','selesai','11','経済（けいざい）','06e08.svg'),
('N3','法','ホウ、ハッ、ホッ、フラン','のり','hukum','8','法律（ほうりつ）','06cd5.svg'),
('N3','議','ギ','','pembahasan','20','会議（かいぎ） · 議論（ぎろん）','08b70.svg'),
('N3','選','セン','えらぶ','memilih','15','選ぶ（えらぶ）','09078.svg'),
('N3','結','ケツ、ケチ','むすぶ、ゆう、ゆわえる','mengikat','12','結果（けっか）','07d50.svg'),
('N3','果','カ','はたす、はたす、はたす、はてる、はてる、はて','hasil','8','結果（けっか）','0679c.svg'),
('N3','報','ホウ','むくいる','laporan','12','報告（ほうこく）','05831.svg'),
('N3','告','コク','つげる','mengumumkan','7','報告（ほうこく）','0544a.svg'),
('N3','関','カン','せき、ぜき、かかわる、からくり、かんぬき','berkaitan','14','関係（かんけい）','095a2.svg'),
('N3','係','ケイ','かかる、かかり、がかり、かかわる','hubungan','9','関係（かんけい）','04fc2.svg'),
('N3','調','チョウ','しらべる、しらべ、ととのう、ととのえる','memeriksa','15','調査（ちょうさ）','08abf.svg'),
('N3','査','サ','','penyelidikan','9','調査（ちょうさ） · 検査（けんさ）','067fb.svg'),
('N3','制','セイ','','sistem','8','制度（せいど）','05236.svg'),
('N3','度','ド、ト、タク','たび、たい','derajat','9','制度（せいど）','05ea6.svg'),
('N3','機','キ','はた','mesin','16','機能（きのう）','06a5f.svg'),
('N3','能','ノウ','よく','kemampuan','10','能力（のうりょく） · 機能（きのう）','080fd.svg'),
('N3','術','ジュツ','すべ','teknik','11','技術（ぎじゅつ）','08853.svg'),
('N3','過','カ','すぎる、すぎる、すぎ、すごす、あやまつ、あやまち、よぎる','melewati','12','過去（かこ）','0904e.svg'),
('N3','論','ロン','','argumen','15','議論（ぎろん）','08ad6.svg'),
('N3','造','ゾウ','つくる、つくり、づくり','membangun','10','製造（せいぞう）','09020.svg'),
('N3','省','セイ、ショウ','かえりみる、はぶく','kementerian','9','省く（はぶく）','07701.svg'),
('N3','費','ヒ','ついやす、ついえる','biaya','12','費用（ひよう）','08cbb.svg'),
('N3','値','チ','ね、あたい','nilai','10','価値（かち）','05024.svg'),
('N2','依','イ、エ','よる','bergantung','8','依頼（いらい）','04f9d.svg'),
('N2','頼','ライ','たのむ、たのもしい、たよる','mengandalkan','16','依頼（いらい）','0983c.svg'),
('N2','態','タイ','わざと','keadaan','14','状態（じょうたい）','0614b.svg'),
('N2','勤','キン、ゴン','つとめる、づとめ、つとまる、いそしむ','bekerja','12','勤務（きんむ）','052e4.svg'),
('N2','雇','コ','やとう','mempekerjakan','12','雇用（こよう）','096c7.svg'),
('N2','縮','シュク','ちぢむ、ちぢまる、ちぢめる、ちぢれる、ちぢらす','menyusut','17','縮小（しゅくしょう） · 凝縮（ぎょうしゅく）','07e2e.svg'),
('N2','拡','カク、コウ','ひろがる、ひろげる、ひろめる','memperluas','8','拡大（かくだい）','062e1.svg'),
('N2','貿','ボウ','','perdagangan','12','貿易（ぼうえき）','08cbf.svg'),
('N2','輸','ユ、シュ','','mengangkut','16','輸入（ゆにゅう）','08f38.svg'),
('N2','需','ジュ','','permintaan','14','需要（じゅよう）','09700.svg'),
('N2','給','キュウ','たまう、たもう、たまえ','memasok','12','供給（きょうきゅう）','07d66.svg'),
('N2','税','ゼイ','','pajak','12','税金（ぜいきん）','07a0e.svg'),
('N2','措','ソ','おく','tindakan','11','措置（そち）','063aa.svg'),
('N2','施','シ、セ','ほどこす','melaksanakan','9','実施（じっし）','065bd.svg'),
('N2','徴','チョウ、チ','しるし','tanda','14','特徴（とくちょう）','05fb4.svg'),
('N2','徹','テツ','','menyeluruh','15','徹底（てってい）','05fb9.svg'),
('N2','慎','シン','つつしむ、つつましい、つつし、つつしみ','berhati-hati','13','慎重（しんちょう）','0614e.svg'),
('N2','検','ケン','しらべる','memeriksa','12','検査（けんさ）','0691c.svg'),
('N2','責','セキ','せめる','tanggung jawab','11','責任（せきにん）','08cac.svg'),
('N2','担','タン','かつぐ、になう','memikul','8','担当（たんとう）','062c5.svg'),
('N2','製','セイ','','memproduksi','14','製造（せいぞう） · 製品（せいひん）','088fd.svg'),
('N2','設','セツ','もうける','mendirikan','11','設備（せつび）','08a2d.svg'),
('N2','備','ビ','そなえる、そなわる、つぶさに','menyiapkan','12','設備（せつび）','05099.svg'),
('N2','蓄','チク','たくわえる','menyimpan','13','蓄積（ちくせき）','084c4.svg'),
('N2','罰','バツ、バチ、ハツ','ばっする','hukuman','14','罰金（ばっきん）','07f70.svg'),
('N1','懸','ケン、ケ','かける、かかる','menggantung','20','懸念（けねん）','061f8.svg'),
('N1','念','ネン','','pikiran','8','懸念（けねん）','05ff5.svg'),
('N1','綱','コウ','つな','garis pedoman','14','綱領（こうりょう）','07db1.svg'),
('N1','紀','キ','','tatanan','9','紀律（きりつ）','07d00.svg'),
('N1','衡','コウ','','keseimbangan','16','均衡（きんこう）','08861.svg'),
('N1','逸','イツ','それる、そらす、はぐれる','menyimpang','11','逸脱（いつだつ）','09038.svg'),
('N1','逐','チク','','mengejar','10','逐次（ちくじ）','09010.svg'),
('N1','帳','チョウ','とばり','buku catatan','11','台帳（だいちょう）','05e33.svg'),
('N1','爵','シャク','','gelar bangsawan','17','爵位（しゃくい）','07235.svg'),
('N1','冠','カン','かんむり','mahkota','9','王冠（おうかん）','051a0.svg'),
('N1','葬','ソウ','ほうむる','menguburkan','12','埋葬（まいそう）','0846c.svg'),
('N1','衰','スイ','おとろえる','merosot','10','衰退（すいたい）','08870.svg'),
('N1','凝','ギョウ','こる、こらす、こごらす、こごらせる、こごる','mengental','16','凝縮（ぎょうしゅく）','051dd.svg'),
('N1','繁','ハン','しげる、しげく','ramai','16','繁栄（はんえい）','07e41.svg'),
('N1','酷','コク','ひどい','kejam','14','冷酷（れいこく）','09177.svg'),
('N1','威','イ','おどす、おどし、おどかす','wibawa','9','威厳（いげん） · 脅威（きょうい）','05a01.svg'),
('N1','慈','ジ','いつくしむ','belas kasih','13','慈悲（じひ）','06148.svg'),
('N1','矛','ム、ボウ','ほこ','tombak','5','矛盾（むじゅん）','077db.svg'),
('N1','盾','ジュン','たて','perisai','9','矛盾（むじゅん）','076fe.svg'),
('N1','覆','フク','おおう、くつがえす、くつがえる','menutupi','18','覆う（おおう）','08986.svg'),
('N1','脅','キョウ','おびやかす、おどす、おどかす','mengancam','10','脅威（きょうい）','08105.svg'),
('N1','肪','ボウ','','lemak','8','脂肪（しぼう）','080aa.svg'),
('N1','疎','ソ、ショ','うとい、うとむ、まばら','renggang','12','疎遠（そえん）','0758e.svg'),
('N1','乖','カイ','そむく、もとる','menyimpang','8','乖離（かいり）','04e56.svg'),
('N1','謳','オウ、ウ','うたう','memuji','18','謳歌（おうか）','08b33.svg')
on conflict (character) do nothing;
update public.level_targets set kanji=108 where level='N5';
insert into public.passages(id,level,title,body,translation) values ('00000000-0000-4000-8200-000000000000','N5','Berita latihan · Pengumuman di perpustakaan','[市|し]の[図書館|としょかん]は、[土曜日|どようび]に[子|こ]どもの[本|ほん]の[会|かい]をします。[午前|ごぜん][十時|じゅうじ]からです。[入|はい]るとき、お[金|かね]はいりません。','Perpustakaan kota mengadakan acara buku anak pada hari Sabtu. Acara dimulai pukul 10 pagi. Masuknya gratis.') on conflict(id) do nothing;
insert into public.listening(id,level,title,path) values ('00000000-0000-4000-8200-000000000001','N5','Pengumuman · Pengumuman di perpustakaan','news/n5.mp3') on conflict(id) do nothing;
insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors) values ('N5','～から～まで','Menandai awal dan akhir waktu atau tempat.','A から B まで','九時から五時まで働きます。 Saya bekerja dari pukul sembilan sampai lima.','Gunakan から untuk awal dan まで untuk akhir.') on conflict(level,pattern) do nothing;
insert into public.vocabulary(level,japanese,reading,romaji,meaning,topic,part_of_speech,example,example_translation) values
('N5','午前','ごぜん','gozen','pagi atau sebelum tengah hari','Berita dan pengumuman','nomina','午前十時に始まります。','Dimulai pukul 10 pagi.'),
('N5','図書館','としょかん','toshokan','perpustakaan','Berita dan pengumuman','nomina','図書館で本を読みます。','Saya membaca buku di perpustakaan.'),
('N5','入口','いりぐち','iriguchi','pintu masuk','Berita dan pengumuman','nomina','入口はあそこです。','Pintu masuknya di sana.')
on conflict(level,japanese,reading) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000002','N5','Acara dimulai pukul berapa?',array['Pukul 10 pagi','Pukul 10 malam']::text[],'00000000-0000-4000-8200-000000000000',null,'dokkai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000002',array['Pukul 10 pagi']::text[],'午前は朝の時間を表します。午前十時 berarti pukul 10 pagi.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000002') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000003','N5','Di lantai berapa acara dimulai?',array['Lantai dua','Lantai satu']::text[],null,'00000000-0000-4000-8200-000000000001','choukai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000003',array['Lantai satu']::text[],'一階 dibaca いっかい dan berarti lantai satu.','ただいま、図書館の一階で、子どもの本の会が始まります。' where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000003') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000004','N5','図書館は九時（　）開きます。',array['から','まで']::text[],null,null,'bunpou') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000004',array['から']::text[],'から menandai waktu mulai.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000004') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000005','N5','Apa arti 午前?',array['jadwal sekolah','pagi atau sebelum tengah hari']::text[],null,null,'moji-goi') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000005',array['pagi atau sebelum tengah hari']::text[],'Arti kata ini dapat ditinjau pada daftar kosakata bertopik Berita dan pengumuman.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000005') on conflict(question_id) do nothing;
insert into public.passages(id,level,title,body,translation) values ('00000000-0000-4000-8200-000000000010','N4','Berita latihan · Jadwal pasar akhir pekan','[公園|こうえん]で[開|ひら]く[市場|いちば]は、[雨|あめ]のため[日曜日|にちようび]に[変更|へんこう]になりました。[時間|じかん]は[午前|ごぜん][九時|くじ]から[午後|ごご][一時|いちじ]までで、[場所|ばしょ]は[変|か]わりません。','Pasar yang diadakan di taman dipindah ke hari Minggu karena hujan. Jamnya pukul sembilan pagi sampai satu siang, dan lokasinya tetap.') on conflict(id) do nothing;
insert into public.listening(id,level,title,path) values ('00000000-0000-4000-8200-000000000011','N4','Pengumuman · Jadwal pasar akhir pekan','news/n4.mp3') on conflict(id) do nothing;
insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors) values ('N4','～ため（理由）','Menyatakan sebab dalam pengumuman formal.','Nomina + のため / verba bentuk biasa + ため','雨のため、試合は中止です。 Pertandingan dibatalkan karena hujan.','Nomina memerlukan の sebelum ため.') on conflict(level,pattern) do nothing;
insert into public.vocabulary(level,japanese,reading,romaji,meaning,topic,part_of_speech,example,example_translation) values
('N4','市場','いちば','ichiba','pasar','Berita dan pengumuman','nomina','市場で野菜を買います。','Saya membeli sayur di pasar.'),
('N4','会場','かいじょう','kaijō','lokasi acara','Berita dan pengumuman','nomina','会場は公園です。','Lokasi acaranya di taman.'),
('N4','中止','ちゅうし','chūshi','pembatalan','Berita dan pengumuman','nomina','試合は中止になりました。','Pertandingan dibatalkan.')
on conflict(level,japanese,reading) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000012','N4','Apa yang berubah?',array['Lokasi pasar','Hari penyelenggaraan']::text[],'00000000-0000-4000-8200-000000000010',null,'dokkai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000012',array['Hari penyelenggaraan']::text[],'日曜日に変更になりました menyatakan perpindahan hari.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000012') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000013','N4','Di mana pasar diadakan?',array['Di taman yang sama','Di dekat stasiun']::text[],null,'00000000-0000-4000-8200-000000000011','choukai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000013',array['Di taman yang sama']::text[],'同じ公園 berarti taman yang sama.','雨のため、土曜日の市場は日曜日に変更になりました。会場は同じ公園です。' where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000013') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000014','N4','雨（　）ため、市場の日が変わりました。',array['を','の']::text[],null,null,'bunpou') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000014',array['の']::text[],'Nomina 雨 diikuti のため.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000014') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000015','N4','Apa arti 市場?',array['pasar','jadwal sekolah']::text[],null,null,'moji-goi') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000015',array['pasar']::text[],'Arti kata ini dapat ditinjau pada daftar kosakata bertopik Berita dan pengumuman.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000015') on conflict(question_id) do nothing;
insert into public.passages(id,level,title,body,translation) values ('00000000-0000-4000-8200-000000000020','N3','Berita latihan · Uji coba bus malam','[市|し]は[来月|らいげつ]から、[駅|えき]と[住宅地|じゅうたくち]を[結|むす]ぶ[夜間|やかん]バスを[試験的|しけんてき]に[運行|うんこう]する。[利用者|りようしゃ]の[数|かず]や[意見|いけん]をもとに、[運行|うんこう]を[続|つづ]けるかどうかを[決|き]めるという。','Mulai bulan depan, pemerintah kota akan menguji coba bus malam yang menghubungkan stasiun dengan kawasan perumahan. Keputusan melanjutkan layanan akan didasarkan pada jumlah penumpang dan masukan mereka.') on conflict(id) do nothing;
insert into public.listening(id,level,title,path) values ('00000000-0000-4000-8200-000000000021','N3','Pengumuman · Uji coba bus malam','news/n3.mp3') on conflict(id) do nothing;
insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors) values ('N3','～をもとに','Menunjukkan data atau bahan yang dijadikan dasar.','Nomina + をもとに（して）','調査結果をもとに計画を立てます。 Kami menyusun rencana berdasarkan hasil survei.','Gunakan を setelah bahan atau dasar yang digunakan.') on conflict(level,pattern) do nothing;
insert into public.vocabulary(level,japanese,reading,romaji,meaning,topic,part_of_speech,example,example_translation) values
('N3','夜間','やかん','yakan','pada malam hari','Berita dan pengumuman','nomina','夜間は入口が閉まります。','Pintu masuk ditutup pada malam hari.'),
('N3','運行','うんこう','unkō','operasi angkutan','Berita dan pengumuman','nomina','バスは通常どおり運行します。','Bus beroperasi seperti biasa.'),
('N3','最終便','さいしゅうびん','saishūbin','keberangkatan terakhir','Berita dan pengumuman','nomina','最終便に間に合いました。','Saya sempat naik keberangkatan terakhir.')
on conflict(level,japanese,reading) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000022','N3','Apa yang akan dipakai untuk mengambil keputusan?',array['Jumlah dan masukan pengguna','Harga tanah di sekitar stasiun']::text[],'00000000-0000-4000-8200-000000000020',null,'dokkai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000022',array['Jumlah dan masukan pengguna']::text[],'利用者の数や意見をもとに menyebut dasar pengambilan keputusan.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000022') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000023','N3','Pukul berapa bus terakhir berangkat?',array['Pukul 11 pagi','Pukul 11 malam']::text[],null,'00000000-0000-4000-8200-000000000021','choukai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000023',array['Pukul 11 malam']::text[],'午後十一時 berarti pukul 11 malam.','来月から夜間バスを試験的に運行します。最終便は駅を午後十一時に出発します。' where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000023') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000024','N3','調査結果（　）、運行計画を立てた。',array['をもとに','を除いて']::text[],null,null,'bunpou') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000024',array['をもとに']::text[],'をもとに menandai dasar penyusunan.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000024') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000025','N3','Apa arti 夜間?',array['jadwal sekolah','pada malam hari']::text[],null,null,'moji-goi') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000025',array['pada malam hari']::text[],'Arti kata ini dapat ditinjau pada daftar kosakata bertopik Berita dan pengumuman.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000025') on conflict(question_id) do nothing;
insert into public.passages(id,level,title,body,translation) values ('00000000-0000-4000-8200-000000000030','N2','Berita latihan · Penyesuaian lampu jalan','[市|し]は[電力消費|でんりょくしょうひ]を[抑|おさ]えるため、[人通|ひとどお]りの[少|すく]ない[時間帯|じかんたい]に[一部|いちぶ]の[街灯|がいとう]の[明|あか]るさを[下|さ]げる。ただし、[住民|じゅうみん]から[安全面|あんぜんめん]の[懸念|けねん]が[示|しめ]された[区間|くかん]は[対象外|たいしょうがい]とする。','Untuk menekan konsumsi listrik, pemerintah kota akan meredupkan sebagian lampu jalan saat lalu lintas pejalan kaki sepi. Ruas yang dikhawatirkan warga dari sisi keselamatan dikecualikan.') on conflict(id) do nothing;
insert into public.listening(id,level,title,path) values ('00000000-0000-4000-8200-000000000031','N2','Pengumuman · Penyesuaian lampu jalan','news/n2.mp3') on conflict(id) do nothing;
insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors) values ('N2','～に際して','Menandai kesempatan atau saat suatu tindakan penting dilakukan.','Nomina / verba bentuk kamus + に際して','工事の開始に際して、住民に説明した。 Saat pekerjaan akan dimulai, warga diberi penjelasan.','Ungkapan ini lazim untuk kegiatan resmi atau penting.') on conflict(level,pattern) do nothing;
insert into public.vocabulary(level,japanese,reading,romaji,meaning,topic,part_of_speech,example,example_translation) values
('N2','街灯','がいとう','gaitō','lampu jalan','Berita dan pengumuman','nomina','街灯の明るさを調整します。','Kami menyesuaikan terang lampu jalan.'),
('N2','対象外','たいしょうがい','taishōgai','di luar cakupan','Berita dan pengumuman','nomina','この区間は対象外です。','Ruas ini dikecualikan.'),
('N2','区間','くかん','kukan','ruas atau segmen','Berita dan pengumuman','nomina','この区間では工事が行われます。','Pekerjaan dilakukan di ruas ini.')
on conflict(level,japanese,reading) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000032','N2','Ruas mana yang dikecualikan?',array['Semua ruas yang sepi pejalan kaki','Ruas yang menurut warga perlu perhatian keselamatan']::text[],'00000000-0000-4000-8200-000000000030',null,'dokkai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000032',array['Ruas yang menurut warga perlu perhatian keselamatan']::text[],'安全面の懸念が示された区間 mengacu pada ruas yang dikhawatirkan dari sisi keselamatan.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000032') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000033','N2','Mengapa beberapa ruas dikecualikan?',array['Warga menyampaikan kekhawatiran soal keselamatan','Lampu jalan belum terpasang']::text[],null,'00000000-0000-4000-8200-000000000031','choukai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000033',array['Warga menyampaikan kekhawatiran soal keselamatan']::text[],'安全面の懸念 menunjukkan kekhawatiran terkait keselamatan.','街灯の明るさを調整しますが、住民から安全面の懸念が示された区間は対象外です。' where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000033') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000034','N2','工事の開始（　）、住民向け説明会を開く。',array['を問わず','に際して']::text[],null,null,'bunpou') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000034',array['に際して']::text[],'に際して menunjukkan saat tindakan resmi dimulai.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000034') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000035','N2','Apa arti 街灯?',array['lampu jalan','jadwal sekolah']::text[],null,null,'moji-goi') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000035',array['lampu jalan']::text[],'Arti kata ini dapat ditinjau pada daftar kosakata bertopik Berita dan pengumuman.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000035') on conflict(question_id) do nothing;
insert into public.passages(id,level,title,body,translation) values ('00000000-0000-4000-8200-000000000040','N1','Berita latihan · Akses arsip digital','[市立|しりつ][博物館|はくぶつかん]は[資料|しりょう]の[公開範囲|こうかいはんい]を[広|ひろ]げる[方針|ほうしん]を[示|しめ]した。[一方|いっぽう]、[寄贈者|きぞうしゃ]の[意向|いこう]や[個人情報|こじんじょうほう]への[配慮|はいりょ]が[必要|ひつよう]な[資料|しりょう]については、[公開|こうかい]に[先立|さきだ]ち、[個別|こべつ]に[審査|しんさ]するという。','Museum kota berencana memperluas akses ke arsipnya. Bahan yang memerlukan perhatian terhadap kehendak donor atau data pribadi akan ditinjau satu per satu sebelum dipublikasikan.') on conflict(id) do nothing;
insert into public.listening(id,level,title,path) values ('00000000-0000-4000-8200-000000000041','N1','Pengumuman · Akses arsip digital','news/n1.mp3') on conflict(id) do nothing;
insert into public.grammar_points(level,pattern,explanation,formula,examples,common_errors) values ('N1','～いかんによって','Menunjukkan bahwa hasil atau keputusan bergantung pada keadaan suatu hal.','Nomina + （の）いかんによって','審査結果いかんによって、公開の可否が決まる。 Izin publikasi bergantung pada hasil peninjauan.','Pola ini formal. Nomina seperti 結果 atau 内容 mendahuluinya.') on conflict(level,pattern) do nothing;
insert into public.vocabulary(level,japanese,reading,romaji,meaning,topic,part_of_speech,example,example_translation) values
('N1','寄贈','きぞう','kizō','hibah atau donasi benda','Berita dan pengumuman','nomina','資料を博物館に寄贈した。','Saya menghibahkan arsip itu kepada museum.'),
('N1','意向','いこう','ikō','kehendak atau niat','Berita dan pengumuman','nomina','寄贈者の意向を確認した。','Kami memastikan kehendak pihak pemberi.'),
('N1','可否','かひ','kahi','boleh atau tidak','Berita dan pengumuman','nomina','公開の可否を審査します。','Kami meninjau apakah publikasi boleh dilakukan.')
on conflict(level,japanese,reading) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000042','N1','Bagaimana museum akan menangani arsip yang sensitif?',array['Meninjau tiap arsip sebelum publikasi','Langsung menerbitkan semua arsip']::text[],'00000000-0000-4000-8200-000000000040',null,'dokkai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000042',array['Meninjau tiap arsip sebelum publikasi']::text[],'公開に先立ち、個別に審査する menyatakan peninjauan per arsip sebelum terbit.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000042') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000043','N1','Apa yang dipertimbangkan sebelum arsip dipublikasikan?',array['Hanya usia arsip','Kehendak donor dan perlindungan data pribadi']::text[],null,'00000000-0000-4000-8200-000000000041','choukai') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000043',array['Kehendak donor dan perlindungan data pribadi']::text[],'寄贈者の意向や個人情報に配慮 menunjukkan dua pertimbangan tersebut.','資料の公開範囲を広げる方針ですが、寄贈者の意向や個人情報に配慮し、公開に先立って個別に審査します。' where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000043') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000044','N1','審査結果（　）、公開の可否が決まる。',array['いかんによって','にかかわらず']::text[],null,null,'bunpou') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000044',array['いかんによって']::text[],'いかんによって menunjukkan ketergantungan pada hasil.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000044') on conflict(question_id) do nothing;
insert into public.questions(id,level,prompt,options,passage_id,listening_id,section) values ('00000000-0000-4000-8200-000000000045','N1','Apa arti 寄贈?',array['jadwal sekolah','hibah atau donasi benda']::text[],null,null,'moji-goi') on conflict do nothing;
insert into public.answer_keys(question_id,answers,explanation,transcript) select '00000000-0000-4000-8200-000000000045',array['hibah atau donasi benda']::text[],'Arti kata ini dapat ditinjau pada daftar kosakata bertopik Berita dan pengumuman.',null where exists(select 1 from public.questions where id='00000000-0000-4000-8200-000000000045') on conflict(question_id) do nothing;
commit;
