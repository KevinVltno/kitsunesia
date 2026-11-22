begin;

insert into public.kana
select substr(glyphs,n,1), script, (string_to_array(romaji,' '))[n],n
from (values
 ('hiragana','あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'),
 ('katakana','アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン')
) as s(script,glyphs)
cross join generate_series(1,46) as g(n)
cross join (values ('a i u e o ka ki ku ke ko sa shi su se so ta chi tsu te to na ni nu ne no ha hi fu he ho ma mi mu me mo ya yu yo ra ri ru re ro wa wo n')) as r(romaji);

insert into public.vocabulary(level,topic,japanese,reading,meaning,example)
select 'N5',* from (values
 ('Sekolah','学校','がっこう','sekolah','学校へ行きます。'),
 ('Sekolah','先生','せんせい','guru','田中さんは先生です。'),
 ('Sekolah','学生','がくせい','pelajar','わたしは学生です。'),
 ('Sekolah','本','ほん','buku','本を読みます。'),
 ('Orang','友達','ともだち','teman','友達と話します。'),
 ('Orang','家族','かぞく','keluarga','家族と住んでいます。'),
 ('Waktu','今日','きょう','hari ini','今日は月曜日です。'),
 ('Waktu','明日','あした','besok','明日、学校へ行きます。'),
 ('Waktu','毎朝','まいあさ','setiap pagi','毎朝、水を飲みます。'),
 ('Waktu','朝','あさ','pagi','朝ごはんを食べます。'),
 ('Makanan','水','みず','air','水を飲みます。'),
 ('Makanan','お茶','おちゃ','teh','お茶をください。'),
 ('Makanan','ご飯','ごはん','nasi / makanan','ご飯を食べます。'),
 ('Makanan','魚','さかな','ikan','魚が好きです。'),
 ('Kegiatan','行く','いく','pergi','駅へ行きます。'),
 ('Kegiatan','読む','よむ','membaca','本を読みます。'),
 ('Kegiatan','食べる','たべる','makan','パンを食べます。'),
 ('Kegiatan','飲む','のむ','minum','水を飲みます。'),
 ('Tempat','駅','えき','stasiun','駅はあそこです。'),
 ('Tempat','家','いえ','rumah','家へ帰ります。')
) as w(topic,japanese,reading,meaning,example);
insert into public.vocabulary(level,topic,japanese,reading,meaning,example) values
 ('N4','Perjalanan','予定','よてい','rencana','週末の予定を教えてください。'),
 ('N4','Perjalanan','乗り換える','のりかえる','berganti kendaraan','東京駅で電車を乗り換えます。');

insert into public.study_plan_templates(level,title,weeks,activities) values
 ('N5','Dasar bahasa Jepang',4,array['huruf','kosakata','membaca','latihan','mendengar']::public.study_kind[]),
 ('N4','Lanjutkan ke N4',4,array['kosakata','membaca','latihan','mendengar']::public.study_kind[]);
insert into public.achievements values ('streak7','Tujuh hari berturut-turut','Belajar selama 7 hari beruntun.'),('words100','Seratus kata','Kuasai 100 kosakata dalam ulasan SM-2.');
insert into public.passages values
 ('00000000-0000-4000-8000-000000000001','N5','Pagi bersama Hana','[私|わたし]はハナです。[毎朝|まいあさ]、[六時|ろくじ]に[起|お]きます。パンを[食|た]べて、[水|みず]を[飲|の]みます。[七時|しちじ]に[学校|がっこう]へ[行|い]きます。','Saya Hana. Setiap pagi saya bangun pukul enam. Saya makan roti dan minum air. Pukul tujuh saya pergi ke sekolah.'),
 ('00000000-0000-4000-8000-000000000002','N4','Perubahan rencana','[日曜日|にちようび]に[山|やま]へ[行|い]く[予定|よてい]でしたが、[雨|あめ]が[降|ふ]ったので、[家|いえ]で[映画|えいが]を[見|み]ました。','Hari Minggu saya berencana pergi ke gunung. Karena hujan turun, saya menonton film di rumah.');
insert into public.listening values
 ('00000000-0000-4000-8000-000000000003','N5','Janji di stasiun','seed/n5.mp3'),
 ('00000000-0000-4000-8000-000000000004','N4','Bertemu lebih pagi','seed/n4.mp3');
insert into public.questions values ('00000000-0000-4000-8000-000000000010','N5','Hana bangun pukul berapa?',array['Pukul lima','Pukul enam','Pukul tujuh']::text[],'00000000-0000-4000-8000-000000000001',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000010',array['Pukul enam'],'六時 berarti pukul enam.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000011','N5','Apa yang Hana makan?',array['Ikan','Nasi','Roti']::text[],'00000000-0000-4000-8000-000000000001',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000011',array['Roti'],'パン artinya roti.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000012','N5','Hana pergi ke mana pukul tujuh?',array['Stasiun','Sekolah','Rumah']::text[],'00000000-0000-4000-8000-000000000001',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000012',array['Sekolah'],'学校へ行きます berarti pergi ke sekolah.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000013','N5','Apa arti 毎朝?',array['Setiap pagi','Hari ini','Besok']::text[],null,null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000013',array['Setiap pagi'],'毎 berarti setiap, dan 朝 berarti pagi.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000014','N5','Tulis bacaan 水 dalam hiragana.',array[]::text[],null,null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000014',array['みず'],'水 dibaca みず ketika berdiri sendiri.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000015','N5','Di mana mereka akan bertemu?',array['Sekolah','Stasiun','Rumah']::text[],null,'00000000-0000-4000-8000-000000000003');
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000015',array['Stasiun'],'駅で menunjukkan lokasi pertemuan.','明日、九時に駅で会いましょう。');
insert into public.questions values ('00000000-0000-4000-8000-000000000016','N4','Mengapa rencana berubah?',array['Hujan turun','Kereta berhenti','Temannya sakit']::text[],'00000000-0000-4000-8000-000000000002',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000016',array['Hujan turun'],'雨が降ったので berarti karena turun hujan.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000017','N4','Apa yang akhirnya dilakukan penutur?',array['Membaca buku','Menonton film','Mendaki gunung']::text[],'00000000-0000-4000-8000-000000000002',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000017',array['Menonton film'],'映画を見ました berarti menonton film.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000018','N4','Di mana penutur menonton film?',array['Di bioskop','Di stasiun','Di rumah']::text[],'00000000-0000-4000-8000-000000000002',null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000018',array['Di rumah'],'家で menyatakan bahwa kegiatan berlangsung di rumah.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000019','N4','Apa fungsi ので pada kalimat 雨が降ったので、家にいました?',array['Menyatakan alasan','Menyatakan tujuan','Menyatakan perbandingan']::text[],null,null);
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000019',array['Menyatakan alasan'],'ので menghubungkan alasan dengan akibat.',null);
insert into public.questions values ('00000000-0000-4000-8000-000000000020','N4','Mengapa harus bertemu lebih pagi?',array['Bus berangkat lebih awal','Toko tutup lebih awal','Ada hujan']::text[],null,'00000000-0000-4000-8000-000000000004');
insert into public.answer_keys values ('00000000-0000-4000-8000-000000000020',array['Bus berangkat lebih awal'],'バスが早く出るので menyatakan alasannya.','バスが早く出るので、八時に集まってください。');

commit;
