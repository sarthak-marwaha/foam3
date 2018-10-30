package net.nanopay.iso8583.test;

public class ISOLLLCharTest
  extends AbstractISOFieldTest
{
  public ISOLLLCharTest() {
    super(new net.nanopay.iso8583.type.ISOLLLChar(10, "Should be 004ABCD"));
  }

  @Override
  public void runTest(foam.core.X x) {
    Test_ISOFieldTest_Pack("ABCD", new byte[] { '0', '0', '4', 'A', 'B', 'C', 'D'}, "\"ABCD\" is packed as [48, 48, 52, 65, 66, 67, 68]");
    Test_ISOFieldTest_Unpack(new byte[] { '0', '0', '4', 'A', 'B', 'C', 'D'}, "ABCD", "[48, 48, 52, 65, 66, 67, 68] is unpacked as \"ABCD\"");
    Test_ISOFieldTest_Reversability("ABCD",  "Unpacked data equals original data");
  }
}
