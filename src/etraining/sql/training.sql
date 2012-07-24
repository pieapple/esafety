INSERT INTO "auth_user" VALUES(1,'门卫一','','','','pbkdf2_sha256$10000$5Luj1yX4FKep$PBDoU1CJDXLitUF0twwnGVYbPx88VMkLt8EjR3e8Ucw=',1,1,1,'2012-07-06 17:10:28','2012-07-06 17:10:28');
INSERT INTO "auth_user" VALUES(2,'门卫二','','','','pbkdf2_sha256$10000$JhOESQeZtOhh$mqeD6ZmZxdD5hlfTRjPJ9DEVOPBAO5OAgxaEjEnZu3M=',1,1,1,'2012-07-06 17:10:39','2012-07-06 17:10:39');
INSERT INTO "auth_user" VALUES(3,'人事处一','','','','pbkdf2_sha256$10000$CSqyNH16M7C6$on0EZXfJoj72pau8tan5S068PWc1SdcsNDf03TdogOI=',1,1,1,'2012-07-06 17:11:03','2012-07-06 17:11:03');
INSERT INTO "auth_user" VALUES(4,'人事处二','','','','pbkdf2_sha256$10000$EIqVmOQ4gz6a$4YzKsjcG2I07zDl5z+wIpRU5XBnkE9kFG2tpJnS+F00=',1,1,1,'2012-07-06 17:11:15','2012-07-06 17:11:15');
INSERT INTO "auth_user" VALUES(5,'主管一','','','','pbkdf2_sha256$10000$BcILubEd3naK$+p3Pe6FddsvoTZWWiebjeFi02yfr9GA5U7H5Dxm63Yw=',1,1,1,'2012-07-06 17:11:30','2012-07-06 17:11:30');
INSERT INTO "auth_user" VALUES(6,'主管二','','','','pbkdf2_sha256$10000$g6Q0iJ6HjNl0$hEcDd56FzrdvZkTd1S/Sn93wXL7wDIRFUh8+ZF3WebA=',1,1,1,'2012-07-06 17:11:46','2012-07-06 17:11:46');

INSERT INTO "etraining_document" VALUES(1,'员工班组培训','本班组员工均需遵守以下条例：
1. 。。。','/media/audio/1343136991.81.mp3','d:/work/esafety/src\media/audio/1343136991.81.mp3');
INSERT INTO "etraining_document" VALUES(2,'入厂告知培训','为了您和他人的安全，进入厂区请遵守以下安全条例：
1. 请关闭手机等无线设备
2. 请戴好安全帽，注意脚下安全
3. 厂区所有位置不准吸烟
4. 请遵守。。。。。。。','/media/audio/1343136944.2.mp3','d:/work/esafety/src\media/audio/1343136944.2.mp3');
INSERT INTO "etraining_document" VALUES(3,'承包商上岗培训','承包商作业时需遵守下列条例：
1. 持证上岗 
2. 通过本培训考试后方能上岗 
3. 请遵守。。。','/media/audio/1343137000.62.mp3','d:/work/esafety/src\media/audio/1343137000.62.mp3');
INSERT INTO "etraining_document" VALUES(4,'员工全厂培训','全厂员工均需遵守以下条例：
1. 。。。','/media/audio/1343136955.61.mp3','d:/work/esafety/src\media/audio/1343136955.61.mp3');
INSERT INTO "etraining_document" VALUES(5,'员工车间培训','本车间员工均需遵守以下条例：
1. 。。。','/media/audio/1343136968.86.mp3','d:/work/esafety/src\media/audio/1343136968.86.mp3');
INSERT INTO "etraining_document" VALUES(6,'老员工日常培训','老员工均需遵守以下条例：
1. 。。。','/media/audio/1343136977.34.mp3','d:/work/esafety/src\media/audio/1343136977.34.mp3');

INSERT INTO "etraining_group" VALUES(1,'所有员工',NULL,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(2,'第一车间',1,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(3,'第二车间',1,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(4,'第三车间',1,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(5,'第四车间',1,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(6,'第一班组',2,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(7,'第二班组',2,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(8,'第三班组',2,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(9,'第四班组',3,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(10,'第五班组',3,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(11,'第六班组',3,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(12,'第七班组',4,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(13,'第八班组',4,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(14,'第九班组',4,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(15,'第十班组',5,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(16,'第十一班组',5,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(17,'第十二班组',5,1,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(18,'所有外来人员',NULL,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(19,'承包商',18,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(20,'访客',18,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(21,'领导',20,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(22,'检查人员',20,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(23,'其他人员',20,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(24,'水电工',19,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(25,'电焊工',19,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(26,'装卸工',19,0,NULL,NULL,NULL,NULL);
INSERT INTO "etraining_group" VALUES(27,'其他工种',19,0,NULL,NULL,NULL,NULL);
