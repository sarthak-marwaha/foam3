package net.nanopay.cico.spi.alterna;

import foam.core.ClassInfo;
import foam.core.FObject;
import net.nanopay.cico.model.EFTReturnRecord;
import org.apache.commons.io.IOUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

/**
 * This class parse the EFT response file
 */

public class EFTReturnFileParser extends EFTFileParser
{
  public List<FObject> parse(InputStream is) {

    List<FObject> ret = new ArrayList<>();
    BufferedReader reader = null;

    try {
      ClassInfo classInfo = EFTReturnRecord.getOwnClassInfo();
      List<Object> propertyInfos = new ArrayList<>();
      propertyInfos.add(classInfo.getAxiomByName("transactionID"));
      propertyInfos.add(classInfo.getAxiomByName("externalReference"));
      propertyInfos.add(classInfo.getAxiomByName("returnCode"));
      propertyInfos.add(classInfo.getAxiomByName("returnDate"));
      propertyInfos.add(classInfo.getAxiomByName("amount"));
      propertyInfos.add(classInfo.getAxiomByName("type"));
      propertyInfos.add(classInfo.getAxiomByName("firstName"));
      propertyInfos.add(classInfo.getAxiomByName("lastName"));
      propertyInfos.add(classInfo.getAxiomByName("account"));
      propertyInfos.add(classInfo.getAxiomByName("bankNumber"));
      propertyInfos.add(classInfo.getAxiomByName("transitNumber"));

      reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));

      parseFile(ret, reader, classInfo, propertyInfos);
    } catch ( IllegalAccessException | IOException | InstantiationException e ) {
      e.printStackTrace();
    } finally {
      IOUtils.closeQuietly(reader);
    }

    return ret;
  }
}