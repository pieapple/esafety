INSERT INTO `etraining_document` VALUES (1,'临时工上岗培训','临时工上岗培训材料',''),(2,'入厂告知培训','入厂告知培训材料',''),(3,'员工班组培训','员工班组培训材料',''),(4,'员工全厂培训','员工全厂培训材料',''),(5,'员工车间培训','员工车间培训材料','');

INSERT INTO `etraining_group` VALUES (1,'第一车间', NULL, 1, NULL),(2,'第二车间', NULL, 1, NULL),(3,'第三车间', NULL, 1, NULL),(4,'第四车间', NULL, 1, NULL),(5,'第一班组', 1, 1, NULL),(6,'第二班组', 1, 1,NULL),(7,'第三班组', 1, 1,NULL),(8,'第四班组', 2, 1,NULL),(9,'第五班组', 2, 1,NULL),(10,'第六班组', 2, 1,NULL),(11,'第七班组', 3, 1,NULL),(12,'第八班组', 3, 1,NULL),(13,'第九班组', 3, 1,NULL),(14,'第十班组', 4, 1,NULL),(15,'第十一班组', 4, 1,NULL),(16,'第十二班组', 4, 1,NULL);

INSERT INTO `etraining_group` VALUES (17,'临时工',NULL, 0, NULL),(18,'访客',NULL, 0, NULL),(19,'领导',18,0,NULL),(20,'检查人员',18,0,NULL),(21,'其他人员',18,0,NULL),(22,'水电工',17,0,NULL),(23,'电焊工',17,0,NULL),(24,'装卸工',17,0,NULL),(25,'其他工种',17,0,NULL);
