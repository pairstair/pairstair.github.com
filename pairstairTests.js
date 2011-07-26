PairStairTest = TestCase("PairstairTest")

PairStairTest.prototype.testInit = function() {
	var pairStair = PairStair();
	assertTrue("this is a really top test", pairStair === "hello");
}