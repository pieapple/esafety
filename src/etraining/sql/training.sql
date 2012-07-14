INSERT INTO `auth_user` VALUES (1,'门卫一','','','','pbkdf2_sha256$10000$5Luj1yX4FKep$PBDoU1CJDXLitUF0twwnGVYbPx88VMkLt8EjR3e8Ucw=',1,1,1,'2012-07-06 17:10:28','2012-07-06 17:10:28'),(2,'门卫二','','','','pbkdf2_sha256$10000$JhOESQeZtOhh$mqeD6ZmZxdD5hlfTRjPJ9DEVOPBAO5OAgxaEjEnZu3M=',1,1,1,'2012-07-06 17:10:39','2012-07-06 17:10:39'),(3,'人事处一','','','','pbkdf2_sha256$10000$CSqyNH16M7C6$on0EZXfJoj72pau8tan5S068PWc1SdcsNDf03TdogOI=',1,1,1,'2012-07-06 17:11:03','2012-07-06 17:11:03'),(4,'人事处二','','','','pbkdf2_sha256$10000$EIqVmOQ4gz6a$4YzKsjcG2I07zDl5z+wIpRU5XBnkE9kFG2tpJnS+F00=',1,1,1,'2012-07-06 17:11:15','2012-07-06 17:11:15'),(5,'主管一','','','','pbkdf2_sha256$10000$BcILubEd3naK$+p3Pe6FddsvoTZWWiebjeFi02yfr9GA5U7H5Dxm63Yw=',1,1,1,'2012-07-06 17:11:30','2012-07-06 17:11:30'),(6,'主管二','','','','pbkdf2_sha256$10000$g6Q0iJ6HjNl0$hEcDd56FzrdvZkTd1S/Sn93wXL7wDIRFUh8+ZF3WebA=',1,1,1,'2012-07-06 17:11:46','2012-07-06 17:11:46');

INSERT INTO `etraining_document` VALUES (1,'员工班组培训','本班组员工均需遵守一下条例：\n1. 。。。','/media/audio/1342251608.51.ogg'),(2,'入厂告知培训','为了您和他人的安全，进入厂区请遵守以下安全条例：\n1. 请关闭手机等无线设备\n2. 请戴好安全帽，注意脚下安全\n3. 厂区所有位置不准吸烟\n4. 请遵守。。。。。。。','/media/audio/1342251602.48.ogg'),(3,'承包商上岗培训','承包商作业时需遵守下列条例：\n1. 持证上岗 \n2. 通过本培训考试后方能上岗 \n3. 请遵守。。。','/media/audio/1342251598.33.ogg'),(4,'员工全厂培训','全厂员工均需遵守一下条例：\n1. 。。。','/media/audio/1342251605.94.ogg'),(5,'员工车间培训','本车间员工均需遵守一下条例：\n1. 。。。','/media/audio/1342251613.48.ogg');

INSERT INTO `etraining_training` VALUES (1,'班组培训','各班组简要培训',1,'班组培训',1,6,10,'2012-07-07',NULL,1),(2,'告知培训','厂区基本安全条例，所有人需遵守',0,NULL,NULL,NULL,NULL,NULL,NULL,2),(3,'承包商培训','承包商上岗条例',0,NULL,2,6,10,'2012-07-07',NULL,3),(4,'全厂培训','全体员工安全条例，所有员工需遵守',1,'厂级培训',4,6,10,'2012-07-07',NULL,4),(5,'车间培训','车间培训，全车间人需参加',1,'车间培训',3,6,10,'2012-07-07',NULL,5),(6,'车间培训','车间培训，全车间人都需参加',1,'车间培训',2,3,5,'2012-07-07',NULL,5),(7,'车间培训','车间培训，全车间人都需参加',1,'车间培训',1,4,6,'2012-07-07',NULL,5),(8,'车间培训','车间培训，全车间人都需参加',1,'车间培训',4,3,4,'2012-07-07',NULL,5),(9,'班组培训','班组培训，全班组人都需参加',1,'班组培训',2,4,8,'2012-07-07',NULL,1);

INSERT INTO `etraining_group` VALUES (1,'第一车间', NULL, 1, NULL, NULL, NULL, NULL),(2,'第二车间', NULL, 1, NULL, NULL,NULL,NULL),(3,'第三车间', NULL, 1, NULL, NULL,NULL,NULL),(4,'第四车间', NULL, 1, NULL, NULL,NULL,NULL),(5,'第一班组', 1, 1, NULL, NULL,NULL,NULL),(6,'第二班组', 1, 1,NULL, NULL,NULL,NULL),(7,'第三班组', 1, 1,NULL, NULL,NULL,NULL),(8,'第四班组', 2, 1,NULL, NULL,NULL,NULL),(9,'第五班组', 2, 1,NULL, NULL,NULL,NULL),(10,'第六班组', 2, 1,NULL, NULL,NULL,NULL),(11,'第七班组', 3, 1,NULL, NULL,NULL,NULL),(12,'第八班组', 3, 1,NULL, NULL,NULL,NULL),(13,'第九班组', 3, 1,NULL, NULL,NULL,NULL),(14,'第十班组', 4, 1,NULL, NULL,NULL,NULL),(15,'第十一班组', 4, 1,NULL, NULL,NULL,NULL),(16,'第十二班组', 4, 1,NULL, NULL,NULL,NULL);

INSERT INTO `etraining_group` VALUES (17,'承包商',NULL, 0, 2, NULL,NULL,NULL),(18,'访客',NULL, 0, 2, NULL,NULL,NULL),(19,'领导',18,0,NULL, NULL,NULL,NULL),(20,'检查人员',18,0,NULL, NULL,NULL,NULL),(21,'其他人员',18,0,NULL, NULL,NULL,NULL),(22,'水电工',17,0,NULL, NULL,NULL,NULL),(23,'电焊工',17,0,NULL, NULL,NULL,NULL),(24,'装卸工',17,0,NULL, NULL,NULL,NULL),(25,'其他工种',17,0,NULL, NULL,NULL,NULL);
